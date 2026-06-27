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

export type SplitSlice = {
  id: string
  label: string
  amount: number
  isPaid: boolean
}

type BillSplitterProps = {
  orderItems: OrderItem[]
  grandTotal: number
  splitMode: 'ITEM' | 'EQUAL' | 'CUSTOM'
  onSetSplitMode: (mode: 'ITEM' | 'EQUAL' | 'CUSTOM') => void
  activeSplitId: string | 'ALL'
  onSetActiveSplitId: (id: string | 'ALL') => void
  onToggleSplitGroup: (itemId: string, currentGroup: number) => void
  splitSlices: SplitSlice[]
  onUpdateSplitSlices: (slices: SplitSlice[]) => void
}

export function BillSplitter({
  orderItems,
  grandTotal,
  splitMode,
  onSetSplitMode,
  activeSplitId,
  onSetActiveSplitId,
  onToggleSplitGroup,
  splitSlices,
  onUpdateSplitSlices,
}: BillSplitterProps) {
  const filteredItems = orderItems.filter(
    (item) => activeSplitId === 'ALL' || item.split_group.toString() === activeSplitId
  )

  const handleEqualSplitChange = (guests: number) => {
    if (guests < 2) return
    const sliceAmount = grandTotal / guests
    const newSlices = Array.from({ length: guests }).map((_, i) => ({
      id: `EQUAL-${i + 1}`,
      label: `Guest ${i + 1}`,
      amount: sliceAmount,
      isPaid: false,
    }))
    onUpdateSplitSlices(newSlices)
    onSetActiveSplitId(newSlices[0].id)
  }

  const handleCustomAdd = () => {
    const currentSum = splitSlices.reduce((acc, s) => acc + s.amount, 0)
    const remaining = Math.max(0, grandTotal - currentSum)
    const newSlices = [
      ...splitSlices,
      {
        id: `CUSTOM-${Date.now()}`,
        label: `Guest ${splitSlices.length + 1}`,
        amount: remaining,
        isPaid: false,
      },
    ]
    onUpdateSplitSlices(newSlices)
  }

  const handleCustomUpdate = (id: string, amount: number) => {
    onUpdateSplitSlices(
      splitSlices.map((s) => (s.id === id ? { ...s, amount } : s))
    )
  }

  const handleCustomRemove = (id: string) => {
    onUpdateSplitSlices(splitSlices.filter((s) => s.id !== id))
  }

  return (
    <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-lg text-slate-900 uppercase">Bill Splitter</h3>
          <div className="flex bg-slate-200 rounded-xl p-1 border border-slate-300">
            {(['ITEM', 'EQUAL', 'CUSTOM'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  onSetSplitMode(mode)
                  if (mode === 'ITEM') onSetActiveSplitId('ALL')
                  else if (mode === 'EQUAL') handleEqualSplitChange(2)
                  else {
                    onUpdateSplitSlices([{ id: `CUSTOM-${Date.now()}`, label: 'Guest 1', amount: grandTotal, isPaid: false }])
                    onSetActiveSplitId(splitSlices[0]?.id || `CUSTOM-${Date.now()}`)
                  }
                }}
                className={cn(
                  'px-3 py-1.5 text-[10px] font-black rounded-lg transition-colors uppercase tracking-widest',
                  splitMode === mode
                    ? 'bg-white text-slate-900 border border-slate-200 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 border border-transparent'
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {splitMode === 'ITEM' && (
          <div className="flex bg-slate-200 rounded-xl p-1.5 border border-slate-300 self-end">
            <button
              onClick={() => onSetActiveSplitId('ALL')}
              className={cn(
                'px-4 py-2 text-xs font-black rounded-lg transition-colors uppercase tracking-widest',
                activeSplitId === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              )}
            >
              ALL
            </button>
            {/* <button
              onClick={() => onSetActiveSplitId('1')}
              className={cn(
                'px-4 py-2 text-xs font-black rounded-lg transition-colors uppercase tracking-widest',
                activeSplitId === '1' ? 'bg-slate-900 text-white' : 'text-slate-500'
              )}
            >
              GUEST 1
            </button> */}
            {/* <button
              onClick={() => onSetActiveSplitId('2')}
              className={cn(
                'px-4 py-2 text-xs font-black rounded-lg transition-colors uppercase tracking-widest',
                activeSplitId === '2' ? 'bg-slate-900 text-white' : 'text-slate-500'
              )}
            >
              GUEST 2
            </button> */}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {splitMode === 'ITEM' && (
          <>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-400 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onToggleSplitGroup(item.id, item.split_group || 1)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-black rounded uppercase tracking-widest border',
                      (item.split_group || 1) === 1
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-900 border-slate-300'
                    )}
                  >
                    G{item.split_group || 1}
                  </button>
                  <span className="font-bold text-slate-900">{item.menu_items?.name}</span>
                </div>
                <span className="font-black text-slate-900">
                  {formatINR(Number(item.menu_items?.price || 0))}
                </span>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <p className="text-center text-slate-400 font-bold py-8 uppercase tracking-widest text-sm">
                No items
              </p>
            )}
          </>
        )}

        {splitMode === 'EQUAL' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <span className="font-black text-indigo-900 uppercase tracking-widest text-sm">Guests</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleEqualSplitChange(splitSlices.length - 1)}
                  className="w-8 h-8 flex items-center justify-center bg-white border border-indigo-200 rounded-lg font-black text-indigo-900"
                >
                  -
                </button>
                <span className="font-black text-lg text-indigo-900">{splitSlices.length}</span>
                <button
                  onClick={() => handleEqualSplitChange(splitSlices.length + 1)}
                  className="w-8 h-8 flex items-center justify-center bg-white border border-indigo-200 rounded-lg font-black text-indigo-900"
                >
                  +
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {splitSlices.map((slice) => (
                <button
                  key={slice.id}
                  onClick={() => !slice.isPaid && onSetActiveSplitId(slice.id)}
                  className={cn(
                    'w-full flex justify-between items-center p-4 rounded-xl border-2 transition-all text-left',
                    slice.isPaid
                      ? 'bg-green-50 border-green-200 opacity-75 cursor-not-allowed'
                      : activeSplitId === slice.id
                      ? 'bg-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-400'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn('w-4 h-4 rounded-full border-2', slice.isPaid ? 'bg-green-500 border-green-500' : 'border-slate-300')} />
                    <span className={cn('font-black uppercase tracking-widest', slice.isPaid ? 'text-green-800' : 'text-slate-900')}>{slice.label}</span>
                  </div>
                  <span className={cn('font-black text-lg', slice.isPaid ? 'text-green-800' : 'text-slate-900')}>
                    {formatINR(slice.amount)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {splitMode === 'CUSTOM' && (
          <div className="space-y-4">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Total: {formatINR(grandTotal)}</span>
              <span className={cn(
                "text-xs font-black uppercase tracking-widest",
                Math.abs(splitSlices.reduce((a, b) => a + b.amount, 0) - grandTotal) < 0.01 ? 'text-green-600' : 'text-red-500'
              )}>
                Allocated: {formatINR(splitSlices.reduce((a, b) => a + b.amount, 0))}
              </span>
            </div>
            
            {splitSlices.map((slice) => (
              <div
                key={slice.id}
                onClick={() => !slice.isPaid && onSetActiveSplitId(slice.id)}
                className={cn(
                  'flex flex-col gap-2 p-4 rounded-xl border-2 transition-all',
                  slice.isPaid
                    ? 'bg-green-50 border-green-200 opacity-75 cursor-not-allowed'
                    : activeSplitId === slice.id
                    ? 'bg-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 cursor-pointer hover:border-slate-400'
                )}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className={cn('w-4 h-4 rounded-full border-2', slice.isPaid ? 'bg-green-500 border-green-500' : 'border-slate-300')} />
                    <span className="font-black uppercase tracking-widest text-sm text-slate-900">{slice.label}</span>
                  </div>
                  {!slice.isPaid && splitSlices.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); handleCustomRemove(slice.id); }} className="text-red-500 text-xs font-bold uppercase">Remove</button>
                  )}
                </div>
                {!slice.isPaid ? (
                  <input
                    type="number"
                    value={slice.amount === 0 ? '' : slice.amount}
                    onChange={(e) => handleCustomUpdate(slice.id, Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-black text-lg mt-2"
                    placeholder="0.00"
                    min="0"
                  />
                ) : (
                  <span className="font-black text-green-800 text-lg mt-2">{formatINR(slice.amount)}</span>
                )}
              </div>
            ))}
            
            <button
              onClick={handleCustomAdd}
              className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl font-black uppercase tracking-widest hover:border-slate-400 hover:text-slate-700 transition-colors text-sm"
            >
              + Add Guest
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
