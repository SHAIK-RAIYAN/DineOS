'use client'

import { ActiveOrderTray } from '@/components/features/waiter/ActiveOrderTray'
import { FloorPlanGrid } from '@/components/features/waiter/FloorPlanGrid'
import { MenuCatalog } from '@/components/features/waiter/MenuCatalog'
import { SentItemsList } from '@/components/features/waiter/SentItemsList'
import { useWaiterStore } from '@/store/useWaiterStore'
import { DEFAULT_OUTLET_ID } from '@/lib/constants'
import { Wifi, WifiOff } from 'lucide-react'
import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { SyncConflict } from '@/types'

export default function WaiterSurface() {
  const {
    isOnline,
    setOnlineStatus,
    offlineQueue,
    clearOfflineQueue,
    removeFromOfflineQueue,
    resetTableSession,
    clearCart,
  } = useWaiterStore()

  const flushOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0 || !navigator.onLine) return

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mutations: offlineQueue,
          outletId: DEFAULT_OUTLET_ID,
        }),
      })

      const result = (await response.json()) as {
        success: boolean
        processed: string[]
        conflicts: SyncConflict[]
      }

      if (result.processed) {
        result.processed.forEach((id) => removeFromOfflineQueue(id))
      }

      if (result.conflicts && result.conflicts.length > 0) {
        result.conflicts.forEach((conflict) => {
          offlineQueue
            .filter((m) => m.type === 'FIRE_ORDER' && m.tableId === conflict.tableId)
            .forEach((m) => removeFromOfflineQueue(m.id))
        })
        resetTableSession()
        clearCart()
      }

      if (result.success && result.processed.length === offlineQueue.length) {
        clearOfflineQueue()
      }
    } catch {
      const fireMutations = offlineQueue.filter((m) => m.type === 'FIRE_ORDER')
      for (const mutation of fireMutations) {
        if (mutation.type !== 'FIRE_ORDER') continue

        const { data: orderData } = await supabase
          .from('orders')
          .select('id, closed_at')
          .eq('table_id', mutation.tableId)
          .is('closed_at', null)
          .maybeSingle()

        if (!orderData) {
          removeFromOfflineQueue(mutation.id)
          resetTableSession()
          continue
        }

        const insertPayload = mutation.items.map((item) => ({
          order_id: mutation.orderId,
          menu_item_id: item.menu_item_id,
          modifiers: item.modifiers,
          status: 'NEW' as const,
        }))

        const { error } = await supabase.from('order_items').insert(insertPayload)
        if (!error) {
          await supabase
            .from('tables')
            .update({ status: 'SENT', updated_at: new Date().toISOString() })
            .eq('id', mutation.tableId)
          removeFromOfflineQueue(mutation.id)
        }
      }
    }
  }, [
    offlineQueue,
    clearOfflineQueue,
    removeFromOfflineQueue,
    resetTableSession,
    clearCart,
  ])

  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true)
      flushOfflineQueue()
    }
    const handleOffline = () => setOnlineStatus(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnlineStatus, flushOfflineQueue])

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col w-full mx-auto relative font-medium text-slate-900">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 min-h-[56px]">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          DineOS Floor
        </h1>
        <div className="flex items-center gap-3">
          {offlineQueue.length > 0 && (
            <span className="text-xs font-bold text-slate-900 bg-slate-200 px-3 py-1.5 rounded-xl">
              {offlineQueue.length} queued
            </span>
          )}
          {isOnline ? (
            <span className="flex items-center gap-2 text-xs font-bold text-green-800 bg-green-100 px-3 py-1.5 rounded-xl">
              <Wifi className="w-4 h-4" />
              ONLINE
            </span>
          ) : (
            <span className="flex items-center gap-2 text-xs font-bold text-red-800 bg-red-100 px-3 py-1.5 rounded-xl">
              <WifiOff className="w-4 h-4" />
              OFFLINE
            </span>
          )}
        </div>
      </header>

      <section className="flex-1 overflow-y-auto pb-32">
        <div className="flex flex-col lg:flex-row h-full">
          <div className="p-4 flex-1 lg:border-r border-slate-200 flex flex-col min-h-0">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">
                Active Zones
              </h2>
              <FloorPlanGrid outletId={DEFAULT_OUTLET_ID} />
            </div>
            <SentItemsList />
          </div>
          <div className="p-4 lg:w-[420px] bg-white border-t lg:border-t-0 border-slate-200">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">
              Menu Catalog
            </h2>
            <MenuCatalog outletId={DEFAULT_OUTLET_ID} />
          </div>
        </div>
      </section>

      <ActiveOrderTray outletId={DEFAULT_OUTLET_ID} />
    </main>
  )
}
