'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { X, Loader2, Utensils } from 'lucide-react'
import { DEFAULT_OUTLET_ID } from '@/lib/constants'
import { motion, AnimatePresence } from 'motion/react'

type MenuItemModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function MenuItemModal({ isOpen, onClose, onSuccess }: MenuItemModalProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [cgst, setCgst] = useState('2.5')
  const [sgst, setSgst] = useState('2.5')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !price || isNaN(Number(price))) {
      setError('Please provide a valid name and price')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('menu_items')
        .insert({
          outlet_id: DEFAULT_OUTLET_ID,
          name: name.trim(),
          price: Number(price),
          cgst_rate: Number(cgst),
          sgst_rate: Number(sgst),
          is_low_stock: false,
        })

      if (insertError) {
        throw new Error(insertError.message)
      }

      setName('')
      setPrice('')
      setCgst('2.5')
      setSgst('2.5')
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to add menu item')
    } finally {
      setIsSubmitting(false)
    }
  }

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
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Add Item</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Menu</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-800 text-xs font-black uppercase tracking-widest rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:border-slate-900 focus:outline-none font-bold text-slate-900 bg-slate-50"
              placeholder="e.g. Garlic Naan"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Price (INR)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:border-slate-900 focus:outline-none font-bold text-slate-900 bg-slate-50"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-900 uppercase tracking-widest">CGST Rate (%)</label>
              <input
                type="number"
                value={cgst}
                onChange={(e) => setCgst(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:border-slate-900 focus:outline-none font-bold text-slate-900 bg-slate-50"
                placeholder="2.5"
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-900 uppercase tracking-widest">SGST Rate (%)</label>
              <input
                type="number"
                value={sgst}
                onChange={(e) => setSgst(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:border-slate-900 focus:outline-none font-bold text-slate-900 bg-slate-50"
                placeholder="2.5"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black active:translate-y-1 transition-all disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {isSubmitting ? 'Saving...' : 'Add Item'}
            </button>
          </div>
        </form>
      </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
