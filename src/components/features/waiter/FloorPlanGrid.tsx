'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useWaiterStore } from '@/store/useWaiterStore'
import { cn } from '@/lib/utils'
import { motion, type Variants } from 'motion/react'
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
    isOnline,
    addToOfflineQueue,
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

      if (!isOnline) {
        addToOfflineQueue({
          id: crypto.randomUUID(),
          type: 'OPEN_TABLE',
          tableId: table.id,
          orderId,
          outletId,
        })
        setTables((current) =>
          current.map((t) =>
            t.id === table.id ? { ...t, status: 'OCCUPIED' } : t
          )
        )
        setActiveOrderId(orderId)
        return
      }

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
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <div
            key={n}
            className="h-16 md:h-20 rounded-xl bg-slate-200 animate-pulse border border-slate-300"
          />
        ))}
      </div>
    )
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 5 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
  }

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
    >
      {tables.map((table) => (
        <motion.button
          variants={itemVariants}
          whileHover={table.status !== 'PAID' ? { scale: 1.03, y: -1 } : {}}
          whileTap={table.status !== 'PAID' ? { scale: 0.96 } : {}}
          key={table.id}
          onClick={() => handleTableClick(table)}
          disabled={table.status === 'PAID'}
          className={cn(
            'min-h-[56px] h-16 md:h-20 rounded-xl flex flex-col items-center justify-center font-bold transition-colors border shadow-sm',
            table.status === 'FREE' &&
              'bg-white text-green-700 border-green-200 hover:border-green-400 hover:shadow-md',
            table.status === 'OCCUPIED' &&
              'bg-red-50 text-red-700 border-red-200 hover:border-red-300 hover:shadow-md',
            table.status === 'SENT' &&
              'bg-yellow-50 text-yellow-700 border-yellow-200 hover:border-yellow-300 hover:shadow-md',
            table.status === 'PAID' &&
              'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed shadow-none',
            selectedTableId === table.id &&
              'ring-2 ring-slate-900 ring-offset-1 border-transparent shadow-md'
          )}
        >
          <span className="text-base md:text-lg font-black">Table {table.table_number}</span>
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-0.5 opacity-80">
            {table.status}
          </span>
        </motion.button>
      ))}
    </motion.div>
  )
}
