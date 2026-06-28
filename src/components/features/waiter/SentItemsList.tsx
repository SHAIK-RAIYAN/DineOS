'use client'

import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useWaiterStore } from '@/store/useWaiterStore'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

type SentItem = {
  id: string
  status: string
  modifiers: Record<string, string>
  menu_items: {
    name: string
  } | null
}

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800 border-blue-200',
  PREPARING: 'bg-orange-100 text-orange-800 border-orange-200',
  READY: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-slate-100 text-slate-500 border-slate-200',
}

export function SentItemsList() {
  const { selectedTableId, resetTableSession } = useWaiterStore()
  const [items, setItems] = useState<SentItem[]>([])
  const [tableStatus, setTableStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isReleasing, setIsReleasing] = useState(false)

  useEffect(() => {
    if (!selectedTableId) return

    const tableId = selectedTableId
    let cancelled = false
    let subscription: ReturnType<typeof supabase.channel> | null = null

    async function fetchItems() {
      setLoading(true)

      const { data: tData } = await supabase
        .from('tables')
        .select('status')
        .eq('id', tableId)
        .maybeSingle()

      if (!cancelled && tData) {
        setTableStatus(tData.status)
      }

      // 1. Decouple from store activeOrderId: dynamically resolve it from the database
      const { data: orderData } = await supabase
        .from('orders')
        .select('id')
        .eq('table_id', tableId)
        .is('closed_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const resolvedOrderId = orderData?.id

      if (!resolvedOrderId) {
        if (!cancelled) {
          setItems([])
          setLoading(false)
        }
        return
      }

      // 2. Query with the correctly resolved order ID and correct fired_at column
      const { data } = await supabase
        .from('order_items')
        .select(`
          id,
          status,
          modifiers,
          menu_items (
            name
          )
        `)
        .eq('order_id', resolvedOrderId)
        .order('fired_at', { ascending: false })

      if (!cancelled) {
        setItems((data as unknown as SentItem[]) || [])
        setLoading(false)

        if (subscription) {
          supabase.removeChannel(subscription)
        }

        subscription = supabase
          .channel(`sent-items-${resolvedOrderId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'order_items',
              filter: `order_id=eq.${resolvedOrderId}`,
            },
            () => {
              void fetchItems()
            }
          )
          .subscribe()
      }
    }

    void fetchItems()

    // 3. Listen to order insertions for this specific table (in case order is created after mount)
    const orderSubscription = supabase
      .channel(`orders-for-table-${tableId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `table_id=eq.${tableId}`,
        },
        () => {
          void fetchItems()
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      if (subscription) supabase.removeChannel(subscription)
      supabase.removeChannel(orderSubscription)
    }
  }, [selectedTableId])

  if (!selectedTableId) return null

  const handleReleaseTable = async () => {
    setIsReleasing(true)
    try {
      const { data: orderData } = await supabase
        .from('orders')
        .select('id')
        .eq('table_id', selectedTableId)
        .is('closed_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (orderData) {
        await supabase.from('orders').delete().eq('id', orderData.id)
      }
      
      await supabase.from('tables').update({ status: 'FREE' }).eq('id', selectedTableId)
      resetTableSession()
    } finally {
      setIsReleasing(false)
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[50vh] bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm">
      <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
        <h2 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
          Live Order Status
        </h2>
        <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-sm">
          {items.length} items
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 relative" data-lenis-prevent>
        <AnimatePresence mode="popLayout">
          {loading && items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 space-y-2"
            >
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </motion.div>
          ) : items.length === 0 && tableStatus === 'OCCUPIED' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center h-40 bg-slate-50 border border-slate-200 rounded-2xl m-4 p-4 text-center space-y-3"
            >
              <div className="text-slate-400 flex flex-col items-center">
                <span className="text-2xl mb-1">🍽️</span>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1">No sent items</p>
              </div>
              <button
                onClick={handleReleaseTable}
                disabled={isReleasing}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-black uppercase tracking-widest text-[10px] transition-colors w-full shadow-sm hover:shadow-md"
              >
                {isReleasing ? 'Freeing...' : 'Free Table'}
              </button>
            </motion.div>
          ) : items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 p-4 text-center"
            >
              <span className="text-2xl opacity-50 mb-1">✓</span>
              <p className="text-[10px] font-bold uppercase tracking-widest">No Active Orders</p>
            </motion.div>
          ) : (
            <div className="p-2 space-y-2">
              {items.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id}
                  className="flex flex-col p-2.5 rounded-xl gap-1.5 border shadow-sm bg-white border-slate-100"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-slate-900 text-xs block">
                        {item.menu_items?.name || 'Unknown Item'}
                      </span>
                    </div>
                    <div className={cn(
                      'flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest whitespace-nowrap shrink-0 border',
                      STATUS_COLORS[item.status] || STATUS_COLORS.NEW
                    )}>
                      {item.status}
                    </div>
                  </div>
                  
                  {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {Object.entries(item.modifiers).map(([key, value]) => {
                        if (key === 'Custom Note') {
                          return (
                            <span key={key} className="text-[9px] font-black uppercase tracking-widest text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md">
                              Note: {String(value)}
                            </span>
                          )
                        }
                        return (
                          <span key={key} className="text-[9px] font-black uppercase tracking-widest text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md">
                            {key.replace(/_/g, ' ')}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}