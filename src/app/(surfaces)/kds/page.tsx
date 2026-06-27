'use client'

import { useEffect, useState } from 'react'
import { TicketBoard } from '@/components/features/kds/TicketBoard'
import { useKdsStore } from '@/store/useKdsStore'
import { DEFAULT_OUTLET_ID } from '@/lib/constants'

export default function KDS() {
  const [now, setNow] = useState(new Date())
  const {
    orders,
    focusedIndex,
    setFocusedIndex,
    subscribe,
    bumpOrder,
    isLoading,
  } = useKdsStore()

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const cleanup = subscribe(DEFAULT_OUTLET_ID)
    return cleanup
  }, [subscribe])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key, 10) - 1
        if (index < orders.length) {
          setFocusedIndex(index)
        }
      }
      if (e.key === ' ' && orders.length > 0) {
        e.preventDefault()
        const target = orders[focusedIndex]
        if (target) bumpOrder(target.id)
      }
      if (e.key === 'ArrowRight' && orders.length > 0) {
        setFocusedIndex(Math.min(focusedIndex + 1, orders.length - 1))
      }
      if (e.key === 'ArrowLeft' && orders.length > 0) {
        setFocusedIndex(Math.max(focusedIndex - 1, 0))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [orders, focusedIndex, setFocusedIndex, bumpOrder])

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6 overflow-x-auto">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
            KDS Ticket Board
          </h1>
          <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest">
            Space to bump · 1-9 select · Arrow keys navigate
          </p>
        </div>
        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">
          {isLoading ? 'Loading...' : `${orders.length} Active Tickets`}
        </div>
      </header>

      <TicketBoard
        orders={orders}
        now={now}
        focusedIndex={focusedIndex}
        onBump={bumpOrder}
        onFocus={setFocusedIndex}
      />
    </main>
  )
}
