'use client'

import { cn, formatINR } from '@/lib/utils'

type OrderItem = {
  id: string
  status: string
  split_group: number
  menu_items: {
    name: string
    price: number
    cgst_rate: number
    sgst_rate: number
  } | null
}

type BillSplitterProps = {
  orderItems: OrderItem[]
  activeSplit: number | 'ALL'
  onSetActiveSplit: (split: number | 'ALL') => void
  onToggleSplitGroup: (itemId: string, currentGroup: number) => void
}

export function BillSplitter({
  orderItems,
  activeSplit,
  onSetActiveSplit,
  onToggleSplitGroup,
}: BillSplitterProps) {
  const filteredItems = orderItems.filter(
    (item) => activeSplit === 'ALL' || item.split_group === activeSplit
  )

  return (
    <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="font-black text-lg text-slate-900 uppercase">Order Items</h3>
        <div className="flex bg-slate-200 rounded-xl p-1.5 border border-slate-300">
          <button
            onClick={() => onSetActiveSplit('ALL')}
            className={cn(
              'px-4 py-2 text-xs font-black rounded-lg transition-colors uppercase tracking-widest',
              activeSplit === 'ALL'
                ? 'bg-white text-slate-900 border border-slate-200'
                : 'text-slate-500 hover:text-slate-700 border border-transparent'
            )}
          >
            ALL
          </button>
          <button
            onClick={() => onSetActiveSplit(1)}
            className={cn(
              'px-4 py-2 text-xs font-black rounded-lg transition-colors uppercase tracking-widest',
              activeSplit === 1
                ? 'bg-slate-900 text-white border border-slate-900'
                : 'text-slate-500 hover:text-slate-700 border border-transparent'
            )}
          >
            GUEST 1
          </button>
          <button
            onClick={() => onSetActiveSplit(2)}
            className={cn(
              'px-4 py-2 text-xs font-black rounded-lg transition-colors uppercase tracking-widest',
              activeSplit === 2
                ? 'bg-slate-900 text-white border border-slate-900'
                : 'text-slate-500 hover:text-slate-700 border border-transparent'
            )}
          >
            GUEST 2
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-400 group transition-colors"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  onToggleSplitGroup(item.id, item.split_group || 1)
                }
                className={cn(
                  'px-3 py-1.5 text-xs font-black rounded uppercase tracking-widest border',
                  (item.split_group || 1) === 1
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-900 border-slate-300'
                )}
              >
                G{item.split_group || 1}
              </button>
              <span className="font-bold text-slate-900">
                {item.menu_items?.name}
              </span>
            </div>
            <span className="font-black text-slate-900">
              {formatINR(Number(item.menu_items?.price || 0))}
            </span>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <p className="text-center text-slate-400 font-bold py-8 uppercase tracking-widest text-sm">
            No items for this guest
          </p>
        )}
      </div>
    </div>
  )
}
