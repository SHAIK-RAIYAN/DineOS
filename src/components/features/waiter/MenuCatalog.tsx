'use client'

import { supabase } from '@/lib/supabase/client'
import { cn, formatINR } from '@/lib/utils'
import { useWaiterStore } from '@/store/useWaiterStore'
import { MODIFIER_PRESETS } from '@/lib/constants'
import { useEffect, useState } from 'react'
import type { ModifierMap } from '@/types'
import { X } from 'lucide-react'

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

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => openModifierModal(item)}
            disabled={item.is_low_stock}
            className={cn(
              'p-4 rounded-xl flex flex-col justify-between items-start text-left transition-all border min-h-[80px]',
              item.is_low_stock
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-white text-slate-900 border-slate-200 hover:border-slate-900'
            )}
          >
            <span className="font-bold text-sm leading-tight line-clamp-2">
              {item.name}
            </span>
            {item.is_low_stock ? (
              <span className="text-xs font-black text-red-700 bg-red-100 px-2 py-0.5 rounded mt-2 uppercase">
                86&apos;d
              </span>
            ) : (
              <span className="text-sm font-bold mt-2">
                {formatINR(Number(item.price))}
              </span>
            )}
          </button>
        ))}
      </div>

      {modalItem && (
        <div className="fixed top-10 left-0 right-0 z-50 flex items-end sm:items-center justify-center  p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div>
                <h3 className="font-black text-lg text-slate-900">
                  {modalItem.name}
                </h3>
                <p className="text-sm font-bold text-slate-500">
                  {formatINR(Number(modalItem.price))}
                </p>
              </div>
              <button
                onClick={() => setModalItem(null)}
                className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-transparent min-h-[48px] min-w-[48px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">
                Modifiers
              </p>
              {MODIFIER_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  onClick={() => toggleModifier(preset.key)}
                  className={cn(
                    'w-full p-4 rounded-xl font-bold text-sm text-left transition-all border min-h-[56px]',
                    modifiers[preset.key]
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-900'
                  )}
                >
                  {preset.label}
                </button>
              ))}
              <div className="mt-4">
                <textarea 
                  placeholder="Custom instructions (e.g. No Cheese, Extra Spicy)"
                  className="w-full p-4 rounded-xl border border-slate-200 text-sm focus:border-slate-900 focus:outline-none resize-none font-bold text-slate-900 bg-slate-50 min-h-[80px]"
                  rows={2}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200">
              <button
                onClick={confirmAddToCart}
                className="w-full py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-black transition-all min-h-[56px]"
              >
                Add to Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
