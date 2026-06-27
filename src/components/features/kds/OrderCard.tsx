'use client'

import { differenceInMinutes, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import type { KdsOrderItem } from '@/types'

type OrderCardProps = {
  order: KdsOrderItem
  now: Date
  isFocused: boolean
  onBump: (id: string) => void
  onFocus: () => void
}

function getAgingBorder(minsElapsed: number): string {
  if (minsElapsed >= 10) return 'border-red-600'
  if (minsElapsed >= 5) return 'border-yellow-500'
  return 'border-green-500'
}

export function OrderCard({
  order,
  now,
  isFocused,
  onBump,
  onFocus,
}: OrderCardProps) {
  const firedAt = new Date(order.fired_at)
  const minsElapsed = differenceInMinutes(now, firedAt)
  const agingBorder = getAgingBorder(minsElapsed)

  return (
    <div
      onClick={onFocus}
      className={cn(
        'flex flex-col justify-between w-80 min-h-[320px] bg-white rounded-2xl overflow-hidden border-4 cursor-pointer',
        agingBorder,
        isFocused && 'ring-4 ring-indigo-600 ring-offset-4 ring-offset-slate-50'
      )}
    >
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-1">
            <span
              className={cn(
                'text-xs font-black px-3 py-1 rounded-full uppercase w-fit',
                order.status === 'NEW'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-orange-100 text-orange-800'
              )}
            >
              {order.status}
            </span>
            {order.table_number && (
              <span className="text-xs font-bold text-slate-500">
                Table {order.table_number}
              </span>
            )}
          </div>
          <span
            className={cn(
              'text-sm font-black',
              minsElapsed >= 10 ? 'text-red-600' : 'text-slate-500'
            )}
          >
            {formatDistanceToNow(firedAt, { addSuffix: true })}
          </span>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">
          {order.menu_items?.name ?? 'Unknown Item'}
        </h2>

        {order.modifiers && Object.keys(order.modifiers).length > 0 && (
          <div className="mt-4 pt-4 border-t-2 border-slate-200 flex-1">
            <p className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
              Modifiers
            </p>
            <ul className="space-y-1">
              {Object.entries(order.modifiers).map(([key, value]) => {
                if (key === 'Custom Note') {
                  return (
                    <li
                      key={key}
                      className="text-sm font-black text-red-800 bg-red-100 p-3 rounded-xl border border-red-200 mt-2"
                    >
                      <span className="uppercase text-[10px] tracking-widest block text-red-600 mb-1">
                        Special Instructions
                      </span>
                      {String(value)}
                    </li>
                  )
                }

                return (
                  <li
                    key={key}
                    className="text-sm font-bold text-slate-700 flex items-start gap-2"
                  >
                    <span className="text-slate-400 font-black">•</span>
                    {key.replace(/_/g, ' ')}: {String(value)}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onBump(order.id)
        }}
        className="w-full h-24 bg-slate-900 hover:bg-black active:bg-slate-800 text-white font-black text-3xl uppercase tracking-widest flex items-center justify-center border-t-4 border-slate-900"
        aria-label={`Bump ${order.menu_items?.name}`}
      >
        BUMP
      </button>
    </div>
  )
}
