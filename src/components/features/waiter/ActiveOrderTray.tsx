'use client'

import { useState, useEffect, useMemo } from 'react'
import { useWaiterStore } from '@/store/useWaiterStore'
import { supabase } from '@/lib/supabase/client'
import { ShoppingCart, Wifi, WifiOff, Loader2, Trash2, Plus, Minus } from 'lucide-react'
import { cn, formatINR } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import NumberFlow from '@number-flow/react'

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
    addToCart,
  } = useWaiterStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const groupedItems = useMemo(() => {
    const groups = cartItems.reduce((acc, item) => {
      const key = `${item.menu_item_id}-${JSON.stringify(item.modifiers)}`
      if (!acc[key]) {
        acc[key] = { ...item, quantity: 1, instanceIds: [item.id] }
      } else {
        acc[key].quantity += 1
        acc[key].instanceIds.push(item.id)
      }
      return acc
    }, {} as Record<string, typeof cartItems[0] & { quantity: number; instanceIds: string[] }>)
    return Object.values(groups)
  }, [cartItems])

  // Removed duplicate useEffect that syncs offline orders manually.
  // Synchronization is handled strictly by waiter/page.tsx flushing to /api/sync.

  const handleFireOrder = async () => {
    if (!selectedTableId || cartItems.length === 0) return

    setIsSubmitting(true)
    setError(null)

    try {
      let orderId = activeOrderId

      const itemsPayload = cartItems.map((item) => ({
        menu_item_id: item.menu_item_id,
        modifiers: item.modifiers,
      }))

      if (!isOnline) {
        if (!orderId) {
          orderId = crypto.randomUUID()
          // We assume OPEN_TABLE might not have fired if orderId was missing,
          // though FloorPlanGrid normally handles it. We queue OPEN_TABLE just in case.
          addToOfflineQueue({
            id: crypto.randomUUID(),
            type: 'OPEN_TABLE',
            tableId: selectedTableId,
            orderId,
            outletId,
          })
          setActiveOrderId(orderId)
        }

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
    <AnimatePresence>
      {cartItems.length > 0 && (
        <motion.div 
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-white border-t border-slate-200 pb-6 sm:pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-2xl z-40"
        >
          <div className="max-w-4xl mx-auto space-y-3">
            {error && (
              <p className="text-[10px] font-black text-red-600 text-center bg-red-50 p-1.5 rounded-lg">{error}</p>
            )}
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2" data-lenis-prevent>
              <AnimatePresence mode="popLayout">
                {groupedItems.map((item) => (
                  <motion.div
                    key={item.instanceIds[0]}
                    layout
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                    className="flex items-center justify-between text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 min-h-[52px] transition-colors"
                  >
                    <div className="flex flex-col flex-1 mr-3">
                      <span className="font-bold text-slate-900 text-sm">
                        {item.menu_item_name}
                      </span>
                      {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 truncate">
                          + {Object.keys(item.modifiers).join(', ')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-black text-slate-900 text-sm w-16 text-right">
                        {formatINR(Number(item.price) * item.quantity)}
                      </span>
                      
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg h-8 shadow-sm">
                        <button
                          onClick={() => removeFromCart(item.instanceIds[0])}
                          className="w-8 h-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-black text-slate-900 text-xs flex items-center justify-center">
                          <NumberFlow value={item.quantity} />
                        </span>
                        <button
                          onClick={() => addToCart({
                            menu_item_id: item.menu_item_id,
                            menu_item_name: item.menu_item_name,
                            price: item.price,
                            modifiers: item.modifiers,
                          })}
                          className="w-8 h-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => item.instanceIds.forEach(id => removeFromCart(id))}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md flex items-center justify-center transition-colors ml-1"
                        aria-label={`Remove ${item.menu_item_name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-3">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 bg-slate-900 rounded-xl shadow-sm shrink-0">
                  <ShoppingCart className="w-4 h-4 text-white" />
                  <motion.span 
                    key={cartItems.length}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center border-2 border-white shadow-sm"
                  >
                    {cartItems.length}
                  </motion.span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Total Order
                  </span>
                  <span className="font-black text-lg text-slate-900 leading-none mt-0.5">
                    {formatINR(cartTotal)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-colors',
                    isOnline
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  )}
                >
                  {isOnline ? (
                    <Wifi className="w-3 h-3" />
                  ) : (
                    <WifiOff className="w-3 h-3" />
                  )}
                  <span className="hidden sm:inline">
                    {isOnline ? 'SYNCED' : 'OFFLINE'}
                  </span>
                </div>
                <button
                  onClick={handleFireOrder}
                  disabled={!selectedTableId || isSubmitting}
                  className={cn(
                    'px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-1.5 min-h-[48px] shadow-sm',
                    selectedTableId && !isSubmitting
                      ? 'bg-slate-900 text-white hover:bg-black hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                  )}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isOnline ? 'FIRE ORDER' : 'QUEUE OFFLINE'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
