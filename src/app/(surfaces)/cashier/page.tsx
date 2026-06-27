'use client'

import { BillSplitter } from '@/components/features/cashier/BillSplitter'
import { OpenTableSidebar } from '@/components/features/cashier/OpenTableSidebar'
import { PaymentModal } from '@/components/features/cashier/PaymentModal'
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
  const [activeSplit, setActiveSplit] = useState<number | 'ALL'>('ALL')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
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
      setActiveSplit('ALL')
      setPaidSplits([])
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

  const calculateTotals = (): GstBreakdown & { cgstRate: number; sgstRate: number } => {
    const filtered = orderItems.filter(
      (item) => activeSplit === 'ALL' || item.split_group === activeSplit
    )
    const gstItems = filtered
      .filter((item) => item.menu_items)
      .map((item) => ({
        price: Number(item.menu_items!.price),
        cgstRate: Number(item.menu_items!.cgst_rate),
        sgstRate: Number(item.menu_items!.sgst_rate),
      }))

    const totals = computeItemsGST(gstItems)
    const firstItem = filtered.find((i) => i.menu_items)
    return {
      ...totals,
      cgstRate: firstItem ? Number(firstItem.menu_items!.cgst_rate) : 2.5,
      sgstRate: firstItem ? Number(firstItem.menu_items!.sgst_rate) : 2.5,
    }
  }

  const totals = calculateTotals()

  const handleRequestDiscount = async () => {
    if (!activeOrder) return
    await supabase
      .from('orders')
      .update({ manager_approval_required: true, manager_approved: false })
      .eq('id', activeOrder.id)
    setActiveOrder((prev) =>
      prev
        ? { ...prev, manager_approval_required: true, manager_approved: false }
        : null
    )
  }

  const handlePay = async (method: 'cash' | 'card' | 'upi') => {
    if (!activeOrder || !selectedTable) return

    setIsProcessing(true)

    try {
      const splitToPay = activeSplit === 'ALL' ? null : activeSplit

      if (splitToPay !== null) {
        const newPaidSplits = [...paidSplits, splitToPay]
        setPaidSplits(newPaidSplits)

        const allGroups = [...new Set(orderItems.map((i) => i.split_group || 1))]
        const allPaid = allGroups.every((g) => newPaidSplits.includes(g))

        if (!allPaid) {
          setShowPaymentModal(false)
          return
        }
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

  const guestLabel =
    activeSplit === 'ALL' ? 'Full Bill' : `Guest ${activeSplit}`

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <OpenTableSidebar
        tables={tables}
        selectedTable={selectedTable}
        onSelectTable={handleSelectTable}
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
              {/* <button
                onClick={handleRequestDiscount}
                className="px-6 py-3 bg-orange-100 text-orange-800 font-bold border border-orange-200 rounded-xl text-sm hover:bg-orange-200 transition-colors uppercase tracking-widest"
              >
                Apply 10% Discount
                <br/>
                <span className='text-xs text-orange-500 font-bold uppercase tracking-widest'>for Terralogic Employees only</span>
              </button> */}
            </header>

            {activeOrder.manager_approval_required && !activeOrder.manager_approved && (
              <div className="mb-4 p-4 bg-orange-100 border border-orange-200 rounded-xl text-orange-800 text-sm font-black uppercase tracking-widest">
                Awaiting manager approval for discount
              </div>
            )}

            <div className="flex gap-8 flex-1 min-h-0">
              <BillSplitter
                orderItems={orderItems}
                activeSplit={activeSplit}
                onSetActiveSplit={setActiveSplit}
                onToggleSplitGroup={toggleSplitGroup}
              />

              <div className="w-[400px] flex flex-col gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col gap-6">
                  <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                    <h3 className="font-black text-xl text-slate-900 uppercase">
                      Bill Summary
                    </h3>
                    <span className="text-xs font-black bg-slate-100 border border-slate-200 text-slate-900 px-3 py-1.5 rounded-full uppercase tracking-widest">
                      {guestLabel}
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
                  disabled={isProcessing || orderItems.length === 0}
                  className={cn(
                    'w-full py-5 rounded-xl font-black text-lg uppercase tracking-widest transition-all border-b-4',
                    isProcessing || orderItems.length === 0
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
        guestLabel={guestLabel}
        requiresApproval={activeOrder?.manager_approval_required ?? false}
        isApproved={activeOrder?.manager_approved ?? false}
        onClose={() => setShowPaymentModal(false)}
        onPay={handlePay}
        isProcessing={isProcessing}
      />
    </div>
  )
}
