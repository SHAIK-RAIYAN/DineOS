'use client'

import type { TopMovingItem } from '@/types'

type TopMovingItemsTableProps = {
  items: TopMovingItem[]
  isLoading: boolean
}

export function TopMovingItemsTable({
  items,
  isLoading,
}: TopMovingItemsTableProps) {
  return (
    <section className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
      <div className="p-6 border-b-2 border-slate-200 bg-slate-900 flex justify-between items-center">
        <h2 className="text-lg font-black text-white uppercase tracking-widest">Top Moving Items</h2>
        <span className="text-xs font-black bg-white/10 text-white border border-white/20 px-3 py-1.5 rounded-full uppercase tracking-widest">
          {items.length} Items
        </span>
      </div>

      <div className="divide-y-2 divide-slate-100 max-h-[400px] overflow-y-auto">
        {items.map((item, index) => (
          <div
            key={item.menu_item_id}
            className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-5">
              <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 font-black text-lg flex items-center justify-center shrink-0 border border-slate-200">
                {index + 1}
              </span>
              <div>
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">{item.name}</h3>
                <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">
                  Outlet: {item.outlet_id.slice(0, 8)}...
                </p>
              </div>
            </div>
            <span className="font-black text-2xl text-slate-900 shrink-0">
              {item.count}x
            </span>
          </div>
        ))}

        {!isLoading && items.length === 0 && (
          <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest">
            No order data yet.
          </div>
        )}

        {isLoading && (
          <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-3">
            <div className="w-5 h-5 rounded-full border-4 border-slate-400 border-t-transparent animate-spin" />
            Loading...
          </div>
        )}
      </div>
    </section>
  )
}
