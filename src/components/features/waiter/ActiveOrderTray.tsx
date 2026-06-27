'use client'

import { useState, useEffect } from 'react'
import { useWaiterStore } from '@/store/useWaiterStore'
import { supabase } from '@/lib/supabase/client'
import { ShoppingCart, Wifi, WifiOff, Loader2, Trash2 } from 'lucide-react'
import { cn, formatINR } from '@/lib/utils'

type ActiveOrderTrayProps = {
  outletId: string
  onSyncComplete?: () => void
}

export function ActiveOrderTray({ outletId, onSyncComplete }: ActiveOrderTrayProps) {
  const {
    cartItems,
    isOnline,
    offlineQueue,
    clearCart,
    removeFromCart,
    clearOfflineQueue,
    selectedTableId,
    activeOrderId,
    setActiveOrderId,
    addToOfflineQueue,
  } = useWaiterStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOnline && offlineQueue.length > 0 && !isSubmitting) {
      const syncOfflineOrders = async () => {
        setIsSubmitting(true)
        
        try {
          for (const mutation of offlineQueue) {
            if (mutation.type === 'FIRE_ORDER') {
              const { error: itemsError } = await supabase
                .from('order_items')
                .insert(mutation.items.map((i: any) => ({
                  order_id: mutation.orderId,
                  menu_item_id: i.menu_item_id,
                  modifiers: i.modifiers,
                  status: 'NEW'
                })))

              if (!itemsError) {
                await supabase
                  .from('tables')
                  .update({ status: 'SENT', updated_at: new Date().toISOString() })
                  .eq('id', mutation.tableId)
              }
            }
          }
        } finally {
          clearOfflineQueue()
          setIsSubmitting(false)
          onSyncComplete?.()
        }
      }

      syncOfflineOrders()
    }
  }, [isOnline, offlineQueue, isSubmitting, clearOfflineQueue, onSyncComplete])

  if (cartItems.length === 0) return null

  const handleFireOrder = async () => {
    if (!selectedTableId || cartItems.length === 0) return

    setIsSubmitting(true)
    setError(null)

    try {
      let orderId = activeOrderId

      if (!orderId) {
        orderId = crypto.randomUUID()
        const { error: orderError } = await supabase.from('orders').insert({
          id: orderId,
          table_id: selectedTableId,
          outlet_id: outletId,
        })
        if (orderError) {
          setError('Failed to create order')
          return
        }
        setActiveOrderId(orderId)
      }

      const itemsPayload = cartItems.map((item) => ({
        menu_item_id: item.menu_item_id,
        modifiers: item.modifiers,
      }))

      if (!isOnline) {
        addToOfflineQueue({
          id: crypto.randomUUID(),
          type: 'FIRE_ORDER',
          tableId: selectedTableId,
          orderId,
          outletId,
          items: itemsPayload,
        })
        clearCart()
        return
      }

      const insertPayload = cartItems.map((item) => ({
        order_id: orderId,
        menu_item_id: item.menu_item_id,
        modifiers: item.modifiers,
        status: 'NEW' as const,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(insertPayload)

      if (itemsError) {
        setError('Failed to fire order')
        return
      }

      await supabase
        .from('tables')
        .update({ status: 'SENT', updated_at: new Date().toISOString() })
        .eq('id', selectedTableId)

      clearCart()
      onSyncComplete?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.price), 0)

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-slate-900 z-50 pb-8">
      <div className="max-w-4xl mx-auto space-y-3">
        {error && (
          <p className="text-xs font-black text-red-600 text-center">{error}</p>
        )}
        <div className="max-h-48 overflow-y-auto space-y-2">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-h-[56px]"
            >
              <span className="font-bold text-slate-900 truncate flex-1">
                {item.menu_item_name}
              </span>
              <div className="flex items-center gap-4 shrink-0">
                <span className="font-black text-slate-900">
                  {formatINR(Number(item.price))}
                </span>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-red-600 bg-red-100 border border-red-200 hover:bg-red-200 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={`Remove ${item.menu_item_name}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-14 h-14 bg-slate-100 rounded-xl border border-slate-200">
              <ShoppingCart className="w-7 h-7 text-slate-900" />
              <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-full min-w-[24px] text-center">
                {cartItems.length}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg text-slate-900">
                {formatINR(cartTotal)}
              </span>
              <span className="text-sm font-bold text-slate-500">
                {cartItems.length} items
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border',
                isOnline
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              )}
            >
              {isOnline ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              {isOnline ? 'SYNCED' : 'OFFLINE'}
            </div>
            <button
              onClick={handleFireOrder}
              disabled={!selectedTableId || isSubmitting}
              className={cn(
                'px-6 rounded-xl font-black text-sm transition-all flex items-center gap-2 min-h-[56px] border-b-4',
                selectedTableId && !isSubmitting
                  ? 'bg-slate-900 text-white hover:bg-black border-black'
                  : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
              )}
            >
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {isOnline ? 'FIRE ORDER' : 'QUEUE OFFLINE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
