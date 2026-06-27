'use client'

import { OrderCard } from './OrderCard'
import type { KdsOrderItem } from '@/types'

type TicketBoardProps = {
  orders: KdsOrderItem[]
  now: Date
  focusedIndex: number
  onBump: (id: string) => void
  onFocus: (index: number) => void
}

export function TicketBoard({
  orders,
  now,
  focusedIndex,
  onBump,
  onFocus,
}: TicketBoardProps) {
  if (orders.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-slate-500 font-bold text-xl border-4 border-slate-200 bg-white rounded-2xl">
        NO ACTIVE TICKETS
      </div>
    )
  }

  return (
    <div className="flex gap-6 pb-8 items-start min-w-max">
      {orders.map((order, index) => (
        <OrderCard
          key={order.id}
          order={order}
          now={now}
          isFocused={index === focusedIndex}
          onBump={onBump}
          onFocus={() => onFocus(index)}
        />
      ))}
    </div>
  )
}
