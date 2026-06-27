'use client'

import { cn } from '@/lib/utils'

type Table = {
  id: string
  table_number: number
  status: string
}

type OpenTableSidebarProps = {
  tables: Table[]
  selectedTable: Table | null
  onSelectTable: (table: Table | null) => void
  onOpenZReport?: () => void
}

export function OpenTableSidebar({
  tables,
  selectedTable,
  onSelectTable,
  onOpenZReport,
}: OpenTableSidebarProps) {
  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-6 border-b border-slate-200 bg-slate-900">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Cashier</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">
          Awaiting Billing
        </h2>
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => onSelectTable(table)}
            className={cn(
              'w-full p-4 rounded-xl flex items-center justify-between transition-all border-2 text-left min-h-[64px]',
              selectedTable?.id === table.id
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 hover:border-slate-900 bg-white text-slate-900'
            )}
          >
            <span className="font-black text-lg">
              Table {table.table_number}
            </span>
            <span className={cn(
              "text-xs font-black px-2 py-1 rounded uppercase tracking-widest border",
              selectedTable?.id === table.id 
                ? "bg-white/10 text-white border-white/20" 
                : "bg-yellow-100 text-yellow-800 border-yellow-200"
            )}>
              {table.status}
            </span>
          </button>
        ))}
        {tables.length === 0 && (
          <div className="text-center p-8 text-slate-500 font-bold border border-slate-200 bg-slate-50 rounded-xl">
            No tables awaiting billing.
          </div>
        )}
      </div>
      <div className="p-6 border-t border-slate-200 bg-slate-50 mt-auto">
        <button
          onClick={onOpenZReport}
          className="w-full py-4 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors border-2 border-slate-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17V7"/></svg>
          Run Z-Report
        </button>
      </div>
    </aside>
  )
}
