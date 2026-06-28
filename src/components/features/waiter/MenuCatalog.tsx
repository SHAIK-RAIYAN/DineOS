'use client'

import { supabase } from '@/lib/supabase/client'
import { cn, formatINR } from '@/lib/utils'
import { useWaiterStore } from '@/store/useWaiterStore'
import { MODIFIER_PRESETS } from '@/lib/constants'
import { useEffect, useState } from 'react'
import type { ModifierMap } from '@/types'
import { X } from 'lucide-react'
import { motion,type Variants, AnimatePresence } from 'motion/react'

type MenuItem = {
  id: string
  name: string
  price: number
  is_low_stock: boolean
}

export function MenuCatalog({ outletId }: { outletId: string }) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [modalItem, setModalItem] = useState<MenuItem | null>(null)
  const [modifiers, setModifiers] = useState<ModifierMap>({})
  const [customNote, setCustomNote] = useState('')
  const { selectedTableId, addToCart } = useWaiterStore()

  useEffect(() => {
    const fetchMenuItems = async () => {
      const { data } = await supabase
        .from('menu_items')
        .select('id, name, price, is_low_stock')
        .eq('outlet_id', outletId)
        .order('name', { ascending: true })

      if (data) setItems(data as MenuItem[])
    }

    fetchMenuItems()

    const subscription = supabase
      .channel(`menu-${outletId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'menu_items',
          filter: `outlet_id=eq.${outletId}`,
        },
        (payload) => {
          setItems((current) =>
            current.map((item) =>
              item.id === payload.new.id
                ? { ...item, is_low_stock: payload.new.is_low_stock as boolean }
                : item
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [outletId])

  const openModifierModal = (item: MenuItem) => {
    if (!selectedTableId || item.is_low_stock) return
    setModalItem(item)
    setModifiers({})
    setCustomNote('')
  }

  const toggleModifier = (key: string) => {
    setModifiers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const confirmAddToCart = () => {
    if (!modalItem) return
    const activeModifiers: ModifierMap = {}
    Object.entries(modifiers).forEach(([key, value]) => {
      if (value) activeModifiers[key] = value
    })
    if (customNote.trim()) {
      activeModifiers['Custom Note'] = customNote.trim()
    }
    addToCart({
      menu_item_id: modalItem.id,
      menu_item_name: modalItem.name,
      price: modalItem.price,
      modifiers: activeModifiers,
    })
    setModalItem(null)
    setModifiers({})
    setCustomNote('')
  }

  if (!selectedTableId) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold border border-slate-200 rounded-xl bg-slate-50">
        Select a table to view the menu
      </div>
    )
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.03 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 5 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 30 },
    },
  };

  return (
    <>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-3"
      >
        {items.map((item) => (
          <motion.button
            variants={itemVariants}
            whileHover={item.is_low_stock ? {} : { scale: 1.03, y: -1 }}
            whileTap={item.is_low_stock ? {} : { scale: 0.96 }}
            key={item.id}
            onClick={() => openModifierModal(item)}
            disabled={item.is_low_stock}
            className={cn(
              'p-3 rounded-xl flex flex-col justify-between items-start text-left transition-colors border min-h-[72px] shadow-sm',
              item.is_low_stock
                ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed shadow-none'
                : 'bg-white text-slate-900 border-slate-200 hover:border-slate-400 hover:shadow-md'
            )}
          >
            <span className="font-bold text-xs leading-tight">
              {item.name}
            </span>
            {item.is_low_stock ? (
              <span className="text-[9px] font-black text-red-700 bg-red-100 px-1.5 py-0.5 rounded mt-2 uppercase tracking-widest">
                86&apos;d
              </span>
            ) : (
              <span className="text-xs font-bold mt-2">
                {formatINR(Number(item.price))}
              </span>
            )}
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence>
        {modalItem && (
          <div className="fixed top-10 left-0 right-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl w-full max-w-sm overflow-hidden border border-slate-200 shadow-2xl pointer-events-auto flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                <div>
                  <h3 className="font-black text-lg text-slate-900">
                    {modalItem.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    {formatINR(Number(modalItem.price))}
                  </p>
                </div>
                <button
                  onClick={() => setModalItem(null)}
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors shadow-sm"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto" data-lenis-prevent>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Modifiers
                </p>
                {MODIFIER_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => toggleModifier(preset.key)}
                    className={cn(
                      'w-full p-3 rounded-xl font-bold text-xs text-left transition-all border min-h-[44px] shadow-sm',
                      modifiers[preset.key]
                        ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
                <div className="mt-4">
                  <textarea 
                    placeholder="Custom instructions (e.g. No Cheese, Extra Spicy)"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none resize-none font-medium text-slate-900 bg-white min-h-[80px] shadow-sm transition-shadow"
                    rows={2}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                  />
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={confirmAddToCart}
                  className="w-full py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-black transition-all min-h-[48px] shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  Add to Order
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
