'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useWaiterStore } from '@/store/useWaiterStore'
import { cn } from '@/lib/utils'
import type { TableStatus } from '@/types'

type Table = {
  id: string
  table_number: number
  status: TableStatus
}

export function FloorPlanGrid({ outletId }: { outletId: string }) {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const {
    selectedTableId,
    selectTable,
    setActiveOrderId,
    resetTableSession,
  } = useWaiterStore()

  useEffect(() => {
    let cancelled = false

    async function init() {
      const { data } = await supabase
        .from('tables')
        .select('id, table_number, status')
        .eq('outlet_id', outletId)
        .order('table_number', { ascending: true })

      if (!cancelled) {
        if (data) setTables(data as Table[])
        setLoading(false)
      }
    }

    void init()

    const subscription = supabase
      .channel(`tables-${outletId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tables',
          filter: `outlet_id=eq.${outletId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTables((current) => {
              const exists = current.some((t) => t.id === payload.new.id)
              if (exists) return current
              return [...current, payload.new as Table].sort(
                (a, b) => a.table_number - b.table_number
              )
            })
          } else if (payload.eventType === 'UPDATE') {
            setTables((current) =>
              current.map((t) =>
                t.id === payload.new.id
                  ? { ...t, status: payload.new.status as TableStatus }
                  : t
              )
            )
            if (
              payload.new.status === 'FREE' &&
              selectedTableId === payload.new.id
            ) {
              resetTableSession()
            }
          }
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(subscription)
    }
  }, [outletId, selectedTableId, resetTableSession])

  const handleTableClick = async (table: Table) => {
    if (table.status === 'PAID') return

    selectTable(table.id)

    if (table.status === 'FREE') {
      const orderId = crypto.randomUUID()
      const { error: orderError } = await supabase.from('orders').insert({
        id: orderId,
        table_id: table.id,
        outlet_id: outletId,
      })

      if (orderError) return

      await supabase
        .from('tables')
        .update({ status: 'OCCUPIED', updated_at: new Date().toISOString() })
        .eq('id', table.id)

      setActiveOrderId(orderId)
      return
    }

    const { data: orderData } = await supabase
      .from('orders')
      .select('id')
      .eq('table_id', table.id)
      .is('closed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (orderData) {
      setActiveOrderId(orderData.id)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="h-16 md:h-20 rounded-xl bg-slate-200 animate-pulse border border-slate-300"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {tables.map((table) => (
        <button
          key={table.id}
          onClick={() => handleTableClick(table)}
          disabled={table.status === 'PAID'}
          className={cn(
            'min-h-[64px] h-16 md:h-20 rounded-xl flex flex-col items-center justify-center font-bold transition-all border',
            table.status === 'FREE' &&
              'bg-green-100 text-green-800 border-green-200',
            table.status === 'OCCUPIED' &&
              'bg-red-100 text-red-800 border-red-200',
            table.status === 'SENT' &&
              'bg-yellow-100 text-yellow-800 border-yellow-200',
            table.status === 'PAID' &&
              'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed',
            selectedTableId === table.id &&
              'ring-2 ring-slate-900 ring-offset-2 border-transparent'
          )}
        >
          <span className="text-lg md:text-xl font-black">Table {table.table_number}</span>
          <span className="text-[10px] md:text-xs uppercase tracking-widest mt-0.5">
            {table.status}
          </span>
        </button>
      ))}
    </div>
  )
}
