'use client'

import { OrderCard } from './OrderCard'
import type { KdsOrderItem } from '@/types'
import { motion, AnimatePresence } from 'motion/react'
import { UtensilsCrossed } from 'lucide-react'

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
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full h-[60vh] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 bg-white/50 rounded-[3rem]"
      >
        <UtensilsCrossed className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="font-black text-2xl uppercase tracking-widest text-slate-300">
          No Active Tickets
        </h2>
        <p className="font-bold text-sm text-slate-400 mt-2 uppercase tracking-widest">
          Kitchen is clear
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div 
      layout
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-8 items-start"
    >
      <AnimatePresence mode="popLayout">
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
      </AnimatePresence>
    </motion.div>
  )
}
