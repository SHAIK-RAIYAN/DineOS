'use client'

import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useWaiterStore } from '@/store/useWaiterStore'
import { useEffect, useState } from 'react'

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
    <div className="mt-6 flex flex-col h-full min-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
          Live Order Status
        </h2>
        <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full uppercase tracking-widest">
          {items.length} Items
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-sm font-bold text-slate-400">
            Loading items...
          </div>
        ) : items.length === 0 && tableStatus === 'OCCUPIED' ? (
          <div className="flex flex-col items-center justify-center h-48 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4">
            <div className="text-slate-400 flex flex-col items-center">
              <span className="text-2xl mb-2">🍽️</span>
              <p className="text-xs font-bold uppercase tracking-widest">No sent items yet</p>
            </div>
            <button
              onClick={handleReleaseTable}
              disabled={isReleasing}
              className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-800 border border-red-200 rounded-xl font-black uppercase tracking-widest text-xs transition-colors w-full"
            >
              {isReleasing ? 'Freeing...' : 'Free Table'}
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400">
            <span className="text-2xl mb-2">🍽️</span>
            <p className="text-xs font-bold uppercase tracking-widest">No sent items yet</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="font-bold text-slate-900 leading-tight">
                  {item.menu_items?.name || 'Unknown Item'}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest border whitespace-nowrap',
                    STATUS_COLORS[item.status] || STATUS_COLORS.NEW
                  )}
                >
                  {item.status}
                </span>
              </div>
              
              {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(item.modifiers).map(([key, value]) => {
                    if (key === 'Custom Note') {
                      return (
                        <span key={key} className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-md">
                          Note: {String(value)}
                        </span>
                      )
                    }
                    return (
                      <span key={key} className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                        {key.replace(/_/g, ' ')}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}