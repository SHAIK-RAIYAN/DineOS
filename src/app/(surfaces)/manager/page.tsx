'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { CrossOutletMetricCards } from '@/components/features/manager/CrossOutletMetricCards'
import { TopMovingItemsTable } from '@/components/features/manager/TopMovingItemsTable'
import { cn, formatINR } from '@/lib/utils'
import { DEFAULT_OUTLET_ID } from '@/lib/constants'
import { AlertTriangle, CheckCircle2, ShieldCheck, Plus, Trash2 } from 'lucide-react'
import type {
  OutletMetrics,
  TopMovingItem,
  PendingApproval,
} from '@/types'

type MenuItem = {
  id: string
  name: string
  price: number
  is_low_stock: boolean
  outlet_id: string
}

export default function ManagerDashboard() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [outletMetrics, setOutletMetrics] = useState<OutletMetrics[]>([])
  const [allTables, setAllTables] = useState<{ id: string; table_number: number; status: string; outlet_id: string }[]>([])
  const [topItems, setTopItems] = useState<TopMovingItem[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>(
    []
  )
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalActiveTables, setTotalActiveTables] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)

    const { data: outletsData } = await supabase
      .from('outlets')
      .select('id, name')

    const { data: tablesData } = await supabase
      .from('tables')
      .select('id, table_number, status, outlet_id')
      .order('table_number', { ascending: true })

    const { data: ordersData } = await supabase
      .from('orders')
      .select(
        `
        id,
        outlet_id,
        closed_at,
        manager_approval_required,
        manager_approved,
        table_id,
        order_items (
          status,
          menu_item_id,
          menu_items (
            name,
            price,
            cgst_rate,
            sgst_rate,
            outlet_id
          )
        ),
        tables ( table_number )
      `
      )

    const { data: itemsData } = await supabase
      .from('menu_items')
      .select('id, name, price, is_low_stock, outlet_id')
      .order('name', { ascending: true })

    if (tablesData) {
      setAllTables(tablesData)
      setTotalActiveTables(tablesData.filter((t) => t.status !== 'FREE').length)
    }

    const outletMap = new Map<string, OutletMetrics>()
    outletsData?.forEach((outlet) => {
      outletMap.set(outlet.id, {
        outlet_id: outlet.id,
        outlet_name: outlet.name,
        revenue: 0,
        active_tables: 0,
        completed_items: 0,
      })
    })

    tablesData?.forEach((table) => {
      if (table.status !== 'FREE') {
        const metric = outletMap.get(table.outlet_id)
        if (metric) metric.active_tables += 1
      }
    })

    let revenue = 0
    const itemCounts = new Map<
      string,
      { name: string; count: number; outlet_id: string }
    >()
    const approvals: PendingApproval[] = []

    ordersData?.forEach((order) => {
      const orderRecord = order as {
        id: string
        outlet_id: string
        closed_at: string | null
        manager_approval_required: boolean
        manager_approved: boolean
        table_id: string
        order_items: Array<{
          status: string
          menu_item_id: string
          menu_items: {
            name: string
            price: number
            cgst_rate: number
            sgst_rate: number
            outlet_id: string
          } | null
        }>
        tables: { table_number: number } | null
      }

      if (
        orderRecord.manager_approval_required &&
        !orderRecord.manager_approved &&
        !orderRecord.closed_at
      ) {
        approvals.push({
          id: orderRecord.id,
          table_id: orderRecord.table_id,
          table_number: orderRecord.tables?.table_number ?? 0,
          outlet_id: orderRecord.outlet_id,
          manager_approval_required: true,
          manager_approved: false,
        })
      }

      orderRecord.order_items?.forEach((item) => {
        if (item.status === 'COMPLETED') {
          const metric = outletMap.get(orderRecord.outlet_id)
          if (metric) metric.completed_items += 1
        }

        if (item.menu_items) {
          const key = item.menu_item_id
          const existing = itemCounts.get(key)
          if (existing) {
            existing.count += 1
          } else {
            itemCounts.set(key, {
              name: item.menu_items.name,
              count: 1,
              outlet_id: item.menu_items.outlet_id,
            })
          }

          if (orderRecord.closed_at) {
            const price = Number(item.menu_items.price)
            const cRate = Number(item.menu_items.cgst_rate)
            const sRate = Number(item.menu_items.sgst_rate)
            const itemTotal = price + price * (cRate / 100) + price * (sRate / 100)
            revenue += itemTotal

            const metric = outletMap.get(orderRecord.outlet_id)
            if (metric) metric.revenue += itemTotal
          }
        }
      })
    })

    setTotalRevenue(revenue)
    setOutletMetrics(Array.from(outletMap.values()))
    setTopItems(
      Array.from(itemCounts.entries())
        .map(([menu_item_id, data]) => ({
          menu_item_id,
          name: data.name,
          count: data.count,
          outlet_id: data.outlet_id,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    )
    setPendingApprovals(approvals)

    if (itemsData) {
      setMenuItems(itemsData as MenuItem[])
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void fetchDashboardData()
    })

    const subscription = supabase
      .channel('manager-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchDashboardData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        () => fetchDashboardData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => fetchDashboardData()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'menu_items' },
        (payload) => {
          setMenuItems((prev) =>
            prev.map((item) =>
              item.id === payload.new.id
                ? {
                    ...item,
                    is_low_stock: payload.new.is_low_stock as boolean,
                  }
                : item
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [fetchDashboardData])

  const handleAddTable = async () => {
    const outletTables = allTables.filter(t => t.outlet_id === DEFAULT_OUTLET_ID)
    const maxTableNumber = outletTables.length > 0 ? Math.max(...outletTables.map(t => t.table_number)) : 0
    
    await supabase.from('tables').insert({
      outlet_id: DEFAULT_OUTLET_ID,
      table_number: maxTableNumber + 1,
      status: 'FREE'
    })
  }

  const handleRemoveTable = async (tableId: string) => {
    await supabase.from('tables').delete().eq('id', tableId)
  }

  const toggleLowStock = async (id: string, currentState: boolean) => {
    const newState = !currentState

    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_low_stock: newState } : item
      )
    )

    await supabase
      .from('menu_items')
      .update({ is_low_stock: newState })
      .eq('id', id)
  }

  const approveOrder = async (orderId: string) => {
    await supabase
      .from('orders')
      .update({ manager_approved: true })
      .eq('id', orderId)

    setPendingApprovals((prev) => prev.filter((a) => a.id !== orderId))
  }

  return (
    <main className="min-h-screen bg-slate-50 md:p-8 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Manager Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Organization Overview — All Outlets
          </p>
        </header>

        <CrossOutletMetricCards
          outletMetrics={outletMetrics}
          totalRevenue={totalRevenue}
          totalActiveTables={totalActiveTables}
          isLoading={isLoading}
        />

        {pendingApprovals.length > 0 && (
          <section className="bg-orange-100 border-2 border-orange-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-6 h-6 text-orange-800" />
              <h2 className="font-black text-orange-900 uppercase tracking-widest">
                Pending Approvals ({pendingApprovals.length})
              </h2>
            </div>
            <div className="space-y-3">
              {pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="flex items-center justify-between bg-white p-5 rounded-xl border-2 border-orange-200"
                >
                  <div>
                    <p className="font-black text-slate-900 text-lg uppercase">
                      Table {approval.table_number} — Discount Request
                    </p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                      Order {approval.id.slice(0, 8)}...
                    </p>
                  </div>
                  <button
                    onClick={() => approveOrder(approval.id)}
                    className="px-6 py-3 bg-slate-900 text-white font-black rounded-xl text-sm hover:bg-black transition-colors uppercase tracking-widest"
                  >
                    Approve
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <TopMovingItemsTable items={topItems} isLoading={isLoading} />

        <section className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
          <div className="p-6 border-b-2 border-slate-200 bg-slate-900 flex justify-between items-center">
            <h2 className="text-lg font-black text-white uppercase tracking-widest">Table Management (Outlet 1)</h2>
            <button
              onClick={handleAddTable}
              className="px-5 py-3 bg-white text-slate-900 font-black rounded-xl text-sm hover:bg-slate-100 transition-colors flex items-center gap-2 uppercase tracking-widest"
            >
              <Plus className="w-5 h-5" /> Add Table
            </button>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-slate-50">
            {allTables.filter(t => t.outlet_id === DEFAULT_OUTLET_ID).map(table => (
              <div key={table.id} className="border-2 border-slate-200 bg-white rounded-xl p-5 flex flex-col items-center gap-3">
                <span className="font-black text-slate-900 text-lg">Table {table.table_number}</span>
                <span className={cn("text-xs font-black px-3 py-1 rounded uppercase tracking-widest border", table.status === 'FREE' ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200")}>
                  {table.status}
                </span>
                {table.status === 'FREE' && (
                  <button onClick={() => handleRemoveTable(table.id)} className="mt-2 text-red-600 hover:text-red-800 p-2 bg-red-100 border border-red-200 hover:bg-red-200 rounded-lg w-full flex justify-center min-h-[44px]">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
          <div className="p-6 border-b-2 border-slate-200 bg-slate-900 flex justify-between items-center">
            <h2 className="text-lg font-black text-white uppercase tracking-widest">
              Menu & Inventory Control
            </h2>
            <span className="text-xs font-black bg-white/10 text-white border border-white/20 px-3 py-1.5 rounded-full uppercase tracking-widest">
              {menuItems.length} Items
            </span>
          </div>

          <div className="divide-y-2 divide-slate-100 max-h-[600px] overflow-y-auto">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-black text-slate-900 text-lg uppercase">
                    {item.name}
                  </h3>
                  <p className="text-slate-500 font-bold text-sm mt-1">
                    {formatINR(Number(item.price))}
                  </p>
                </div>

                <button
                  onClick={() => toggleLowStock(item.id, item.is_low_stock)}
                  className={cn(
                    'flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black text-sm transition-all w-full md:w-auto shrink-0 border-2 uppercase tracking-widest',
                    item.is_low_stock
                      ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                      : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                  )}
                >
                  {item.is_low_stock ? (
                    <>
                      <AlertTriangle className="w-5 h-5" />
                      Low Stock / 86&apos;d
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      In Stock
                    </>
                  )}
                </button>
              </div>
            ))}

            {!isLoading && menuItems.length === 0 && (
              <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest">
                No menu items found.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
