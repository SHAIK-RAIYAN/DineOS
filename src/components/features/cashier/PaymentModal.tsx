'use client'

import { formatINR } from '@/lib/utils'
import type { GstBreakdown } from '@/types'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import NumberFlow from '@number-flow/react'

type PaymentModalProps = {
  isOpen: boolean
  tableNumber: number
  totals: GstBreakdown
  cgstRate: number
  sgstRate: number
  guestLabel: string
  requiresApproval: boolean
  isApproved: boolean
  onClose: () => void
  onPay: (method: 'cash' | 'card' | 'upi') => void
  isProcessing: boolean
}

export function PaymentModal({
  isOpen,
  tableNumber,
  totals,
  cgstRate,
  sgstRate,
  guestLabel,
  requiresApproval,
  isApproved,
  onClose,
  onPay,
  isProcessing,
}: PaymentModalProps) {
  const blocked = requiresApproval && !isApproved

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden border-2 border-slate-200 shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-900">
          <div>
            <h3 className="font-black text-xl text-white uppercase tracking-tight">
              Table {tableNumber} — {guestLabel}
            </h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Payment & Receipt</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-xl hover:bg-slate-800 text-white min-h-[48px] min-w-[48px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

            <div className="p-8 space-y-4 text-sm">
              <div className="flex justify-between text-slate-900 font-bold items-center">
                <span>Subtotal</span>
                <span className="flex items-center">₹<NumberFlow value={totals.subtotal} /></span>
              </div>
              <div className="flex justify-between text-slate-500 font-bold items-center">
                <span>CGST ({cgstRate}%)</span>
                <span className="flex items-center">₹<NumberFlow value={totals.cgst} /></span>
              </div>
              <div className="flex justify-between text-slate-500 font-bold items-center">
                <span>SGST ({sgstRate}%)</span>
                <span className="flex items-center">₹<NumberFlow value={totals.sgst} /></span>
              </div>
              <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                <span className="font-black text-slate-900 text-lg uppercase tracking-widest">Total</span>
                <span className="text-4xl font-black text-slate-900 flex items-center">
                  ₹<NumberFlow value={totals.total} />
                </span>
              </div>
            </div>

        {blocked && (
          <div className="mx-8 mb-6 p-4 bg-red-100 border border-red-200 rounded-xl text-red-800 text-xs font-black text-center uppercase tracking-widest">
            Manager approval required before payment
          </div>
        )}

        <div className="p-8 pt-0 grid grid-cols-3 gap-3">
          <button
            onClick={() => onPay('cash')}
            disabled={isProcessing || blocked}
            className="py-4 bg-slate-100 text-slate-900 border-2 border-slate-200 font-black rounded-xl hover:border-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest transition-colors min-h-[64px]"
          >
            Cash
          </button>
          <button
            onClick={() => onPay('card')}
            disabled={isProcessing || blocked}
            className="py-4 bg-slate-100 text-slate-900 border-2 border-slate-200 font-black rounded-xl hover:border-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest transition-colors min-h-[64px]"
          >
            Card
          </button>
          <button
            onClick={() => onPay('upi')}
            disabled={isProcessing || blocked}
            className="py-4 bg-slate-100 text-slate-900 border-2 border-slate-200 font-black rounded-xl hover:border-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest transition-colors min-h-[64px]"
          >
            UPI
          </button>
        </div>

            <div className="p-6 pt-0 text-center border-t border-slate-200 mt-2 bg-slate-50 flex items-center justify-center">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-4">
                Mock payment — no gateway integration
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
