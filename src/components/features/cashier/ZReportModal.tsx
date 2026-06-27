'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { DEFAULT_OUTLET_ID } from '@/lib/constants'
import { formatINR, computeItemsGST } from '@/lib/utils'
import { X, Receipt, Download, Loader2 } from 'lucide-react'

type ZReportModalProps = {
  isOpen: boolean
  onClose: () => void
}

type PaymentSummary = {
  cash: number
  card: number
  upi: number
  total: number
  cgst: number
  sgst: number
  orderCount: number
}

export function ZReportModal({ isOpen, onClose }: ZReportModalProps) {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<PaymentSummary | null>(null)

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    setLoading(true)

    async function fetchReport() {
      // For demo purposes, we fetch all closed orders.
      // In production, we'd filter by >= start of current shift/day.
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id,
          payment_method,
          order_items (
            menu_items (
              price,
              cgst_rate,
              sgst_rate
            )
          )
        `)
        .not('closed_at', 'is', null)
        .eq('outlet_id', DEFAULT_OUTLET_ID)

      if (cancelled || !orders) return

      let cash = 0
      let card = 0
      let upi = 0
      let totalCgst = 0
      let totalSgst = 0
      let grandTotal = 0

      for (const order of orders as any[]) {
        const gstItems = (order.order_items as any[])
          .filter((item) => item.menu_items)
          .map((item) => ({
            price: Number(item.menu_items.price),
            cgstRate: Number(item.menu_items.cgst_rate),
            sgstRate: Number(item.menu_items.sgst_rate),
          }))
        
        if (gstItems.length > 0) {
          const totals = computeItemsGST(gstItems)
          grandTotal += totals.total
          totalCgst += totals.cgst
          totalSgst += totals.sgst

          if (order.payment_method === 'cash') cash += totals.total
          else if (order.payment_method === 'card') card += totals.total
          else if (order.payment_method === 'upi') upi += totals.total
        }
      }

      setSummary({
        cash,
        card,
        upi,
        total: grandTotal,
        cgst: totalCgst,
        sgst: totalSgst,
        orderCount: (orders as any[]).length,
      })
      setLoading(false)
    }

    void fetchReport()

    return () => {
      cancelled = true
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Z-Report</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">End of Night Summary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          {loading || !summary ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Generating Report...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Grand Total */}
              <div className="text-center">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Total Daily Revenue</p>
                <p className="text-5xl font-black text-slate-900 tracking-tighter">
                  {formatINR(summary.total)}
                </p>
                <p className="text-sm font-bold text-slate-400 mt-2">Across {summary.orderCount} closed orders</p>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">
                  By Payment Method
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700">Cash</span>
                    <span className="font-black text-slate-900">{formatINR(summary.cash)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700">Card / POS</span>
                    <span className="font-black text-slate-900">{formatINR(summary.card)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700">UPI</span>
                    <span className="font-black text-slate-900">{formatINR(summary.upi)}</span>
                  </div>
                </div>
              </div>

              {/* Tax Collected */}
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">
                  Tax Collected (Liability)
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="font-bold text-red-800">Total CGST</span>
                    <span className="font-black text-red-900">{formatINR(summary.cgst)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="font-bold text-red-800">Total SGST</span>
                    <span className="font-black text-red-900">{formatINR(summary.sgst)}</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4">
          <button
            onClick={() => window.print()}
            disabled={loading}
            className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black active:translate-y-1 transition-all disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            Print Report
          </button>
        </div>
      </div>
    </div>
  )
}
