'use client'

import { BillSplitter, type SplitSlice } from '@/components/features/cashier/BillSplitter'
import { OpenTableSidebar } from '@/components/features/cashier/OpenTableSidebar'
import { PaymentModal } from '@/components/features/cashier/PaymentModal'
import { ZReportModal } from '@/components/features/cashier/ZReportModal'
import { DEFAULT_OUTLET_ID } from '@/lib/constants'
import { supabase } from '@/lib/supabase/client'
import { cn, computeItemsGST, formatINR } from '@/lib/utils'
import type { GstBreakdown } from '@/types'
import { useCallback, useEffect, useState } from 'react'

type Table = {
  id: string
  table_number: number
  status: string
}

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

type Order = {
  id: string
  table_id: string
  closed_at: string | null
  manager_approval_required: boolean
  manager_approved: boolean
}

export default function CashierTerminal() {
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [splitMode, setSplitMode] = useState<'ITEM' | 'EQUAL' | 'CUSTOM'>('ITEM')
  const [activeSplitId, setActiveSplitId] = useState<string | 'ALL'>('ALL')
  const [splitSlices, setSplitSlices] = useState<SplitSlice[]>([])
  
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showZReport, setShowZReport] = useState(false)
  const [paidSplits, setPaidSplits] = useState<number[]>([])

  const fetchTables = useCallback(async () => {
    const { data } = await supabase
      .from('tables')
      .select('id, table_number, status')
      .eq('outlet_id', DEFAULT_OUTLET_ID)
      .in('status', ['SENT', 'OCCUPIED'])
      .order('table_number', { ascending: true })

    if (data) setTables(data)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      const { data } = await supabase
        .from('tables')
        .select('id, table_number, status')
        .eq('outlet_id', DEFAULT_OUTLET_ID)
        .in('status', ['SENT', 'OCCUPIED'])
        .order('table_number', { ascending: true })

      if (!cancelled && data) setTables(data)
    }

    void init()

    const subscription = supabase
      .channel(`cashier-tables-${DEFAULT_OUTLET_ID}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tables',
          filter: `outlet_id=eq.${DEFAULT_OUTLET_ID}`,
        },
        () => {
          fetchTables()
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(subscription)
    }
  }, [fetchTables])

  useEffect(() => {
    if (!selectedTable) return

    const table = selectedTable
    let cancelled = false

    async function loadOrderDetails() {
      const { data: orderData } = await supabase
        .from('orders')
        .select(
          'id, table_id, closed_at, manager_approval_required, manager_approved'
        )
        .eq('table_id', table.id)
        .is('closed_at', null)
        .limit(1)
        .maybeSingle()

      if (!orderData) {
        if (!cancelled) {
          setActiveOrder(null)
          setOrderItems([])
        }
        return
      }

      const order = orderData as Order
      if (!cancelled) setActiveOrder(order)

      const { data: itemsData } = await supabase
        .from('order_items')
        .select(
          `
            id,
            status,
            split_group,
            menu_items (
              name,
              price,
              cgst_rate,
              sgst_rate
            )
          `
        )
        .eq('order_id', order.id)

      if (itemsData && !cancelled) {
        setOrderItems(itemsData as unknown as OrderItem[])
      }
    }

    void loadOrderDetails()

    const subscription = supabase
      .channel(`cashier-order-${table.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => {
          void loadOrderDetails()
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        () => {
          void loadOrderDetails()
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(subscription)
    }
  }, [selectedTable])

  const handleSelectTable = (table: Table | null) => {
    setSelectedTable(table)
    if (!table) {
      setActiveOrder(null)
      setOrderItems([])
      setActiveSplitId('ALL')
      setPaidSplits([])
      setSplitMode('ITEM')
      setSplitSlices([])
    }
  }

  const toggleSplitGroup = async (itemId: string, currentGroup: number) => {
    const newGroup = currentGroup === 1 ? 2 : 1

    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, split_group: newGroup } : item
      )
    )

    await supabase
      .from('order_items')
      .update({ split_group: newGroup })
      .eq('id', itemId)
  }

  const getGrandTotal = () => {
    const gstItems = orderItems
      .filter((item) => item.menu_items)
      .map((item) => ({
        price: Number(item.menu_items!.price),
        cgstRate: Number(item.menu_items!.cgst_rate),
        sgstRate: Number(item.menu_items!.sgst_rate),
      }))
    return computeItemsGST(gstItems).total
  }

  const calculateTotals = (): GstBreakdown & { cgstRate: number; sgstRate: number } => {
    const firstItem = orderItems.find((i) => i.menu_items)
    const baseCgstRate = firstItem ? Number(firstItem.menu_items!.cgst_rate) : 2.5
    const baseSgstRate = firstItem ? Number(firstItem.menu_items!.sgst_rate) : 2.5

    if (splitMode === 'ITEM') {
      const filtered = orderItems.filter(
        (item) => activeSplitId === 'ALL' || item.split_group.toString() === activeSplitId
      )
      const gstItems = filtered
        .filter((item) => item.menu_items)
        .map((item) => ({
          price: Number(item.menu_items!.price),
          cgstRate: Number(item.menu_items!.cgst_rate),
          sgstRate: Number(item.menu_items!.sgst_rate),
        }))
      return { ...computeItemsGST(gstItems), cgstRate: baseCgstRate, sgstRate: baseSgstRate }
    } else {
      const gstItems = orderItems
        .filter((item) => item.menu_items)
        .map((item) => ({
          price: Number(item.menu_items!.price),
          cgstRate: Number(item.menu_items!.cgst_rate),
          sgstRate: Number(item.menu_items!.sgst_rate),
        }))
      const grandTotals = computeItemsGST(gstItems)
      const currentSlice = splitSlices.find(s => s.id === activeSplitId)
      
      if (!currentSlice) {
        return { subtotal: 0, cgst: 0, sgst: 0, total: 0, cgstRate: baseCgstRate, sgstRate: baseSgstRate }
      }
      
      const ratio = grandTotals.total > 0 ? currentSlice.amount / grandTotals.total : 0
      return {
        subtotal: grandTotals.subtotal * ratio,
        cgst: grandTotals.cgst * ratio,
        sgst: grandTotals.sgst * ratio,
        total: currentSlice.amount,
        cgstRate: baseCgstRate,
        sgstRate: baseSgstRate
      }
    }
  }

  const totals = calculateTotals()

  const handlePay = async (method: 'cash' | 'card' | 'upi') => {
    if (!activeOrder || !selectedTable) return

    setIsProcessing(true)

    try {
      let isFullyPaid = false

      if (splitMode === 'ITEM') {
        if (activeSplitId !== 'ALL') {
          const newPaidSplits = [...paidSplits, Number(activeSplitId)]
          setPaidSplits(newPaidSplits)

          const allGroups = [...new Set(orderItems.map((i) => i.split_group || 1))]
          isFullyPaid = allGroups.every((g) => newPaidSplits.includes(g))
        } else {
          isFullyPaid = true
        }
      } else {
        const updatedSlices = splitSlices.map(s => 
          s.id === activeSplitId ? { ...s, isPaid: true } : s
        )
        setSplitSlices(updatedSlices)
        isFullyPaid = updatedSlices.every(s => s.isPaid)
        
        // Find next unpaid slice to activate automatically
        const nextUnpaid = updatedSlices.find(s => !s.isPaid)
        if (nextUnpaid && !isFullyPaid) {
          setActiveSplitId(nextUnpaid.id)
        }
      }

      if (!isFullyPaid) {
        setShowPaymentModal(false)
        return
      }

      await supabase
        .from('orders')
        .update({
          closed_at: new Date().toISOString(),
          payment_method: method,
        })
        .eq('id', activeOrder.id)

      await supabase
        .from('tables')
        .update({ status: 'FREE', updated_at: new Date().toISOString() })
        .eq('id', selectedTable.id)

      setShowPaymentModal(false)
      setSelectedTable(null)
      fetchTables()
    } finally {
      setIsProcessing(false)
    }
  }

  const getGuestLabel = () => {
    if (splitMode === 'ITEM') {
      return activeSplitId === 'ALL' ? 'Full Bill' : `Guest ${activeSplitId}`
    }
    const currentSlice = splitSlices.find(s => s.id === activeSplitId)
    return currentSlice ? currentSlice.label : 'Select Split'
  }

  const canPay = () => {
    if (orderItems.length === 0) return false
    if (splitMode === 'CUSTOM') {
      const allocated = splitSlices.reduce((sum, s) => sum + s.amount, 0)
      if (Math.abs(allocated - getGrandTotal()) > 0.01) return false
    }
    const currentSlice = splitSlices.find(s => s.id === activeSplitId)
    if ((splitMode === 'CUSTOM' || splitMode === 'EQUAL') && currentSlice?.isPaid) return false
    if ((splitMode === 'CUSTOM' || splitMode === 'EQUAL') && splitSlices.length === 0) return false
    if (splitMode === 'ITEM' && activeSplitId !== 'ALL' && paidSplits.includes(Number(activeSplitId))) return false
    return true
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <OpenTableSidebar
        tables={tables}
        selectedTable={selectedTable}
        onSelectTable={handleSelectTable}
        onOpenZReport={() => setShowZReport(true)}
      />

      <main className="flex-1 flex flex-col bg-slate-50 border-l border-slate-200">
        {selectedTable && activeOrder ? (
          <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-8">
            <header className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-slate-900 uppercase">
                  Table {selectedTable.table_number}
                </h2>
                <p className="text-slate-500 font-bold mt-2 text-sm uppercase tracking-widest">
                  Order ID: {activeOrder.id.slice(0, 8)}...
                </p>
              </div>
            </header>

            {activeOrder.manager_approval_required && !activeOrder.manager_approved && (
              <div className="mb-4 p-4 bg-orange-100 border border-orange-200 rounded-xl text-orange-800 text-sm font-black uppercase tracking-widest">
                Awaiting manager approval for discount
              </div>
            )}

            <div className="flex gap-8 flex-1 min-h-0">
              <BillSplitter
                orderItems={orderItems}
                grandTotal={getGrandTotal()}
                splitMode={splitMode}
                onSetSplitMode={setSplitMode}
                activeSplitId={activeSplitId}
                onSetActiveSplitId={setActiveSplitId}
                onToggleSplitGroup={toggleSplitGroup}
                splitSlices={splitSlices}
                onUpdateSplitSlices={setSplitSlices}
              />

              <div className="w-[400px] flex flex-col gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col gap-6">
                  <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                    <h3 className="font-black text-xl text-slate-900 uppercase">
                      Bill Summary
                    </h3>
                    <span className="text-xs font-black bg-slate-100 border border-slate-200 text-slate-900 px-3 py-1.5 rounded-full uppercase tracking-widest">
                      {getGuestLabel()}
                    </span>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between text-slate-900 font-bold">
                      <span>Subtotal</span>
                      <span>{formatINR(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-bold">
                      <span>CGST ({totals.cgstRate}%)</span>
                      <span>{formatINR(totals.cgst)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-bold">
                      <span>SGST ({totals.sgstRate}%)</span>
                      <span>{formatINR(totals.sgst)}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                    <span className="font-black text-slate-900 uppercase tracking-widest">Total</span>
                    <span className="text-4xl font-black text-slate-900">
                      {formatINR(totals.total)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={isProcessing || !canPay()}
                  className={cn(
                    'w-full py-5 rounded-xl font-black text-lg uppercase tracking-widest transition-all border-b-4',
                    isProcessing || !canPay()
                      ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-black text-white border-black active:translate-y-1 active:border-b-0'
                  )}
                >
                  {isProcessing ? 'Processing...' : 'Collect Payment'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🧾</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">
                Select a Table
              </h2>
              <p className="text-slate-500 font-bold max-w-sm">
                Choose a table from the sidebar to view the check and process
                payment.
              </p>
            </div>
          </div>
        )}
      </main>

      <PaymentModal
        isOpen={showPaymentModal}
        tableNumber={selectedTable?.table_number ?? 0}
        totals={totals}
        cgstRate={totals.cgstRate}
        sgstRate={totals.sgstRate}
        guestLabel={getGuestLabel()}
        requiresApproval={activeOrder?.manager_approval_required ?? false}
        isApproved={activeOrder?.manager_approved ?? false}
        onClose={() => setShowPaymentModal(false)}
        onPay={handlePay}
        isProcessing={isProcessing}
      />

      <ZReportModal
        isOpen={showZReport}
        onClose={() => setShowZReport(false)}
      />
    </div>
  )
}
