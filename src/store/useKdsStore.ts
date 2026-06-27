import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import type { KdsOrderItem, ItemStatus } from '@/types'

type KdsJoinRow = {
  id: string
  status: ItemStatus
  modifiers: Record<string, boolean | string>
  fired_at: string
  order_id: string
  menu_items: { name: string } | null
  orders: {
    outlet_id: string
    tables: { table_number: number } | null
  } | null
}

type KdsState = {
  orders: KdsOrderItem[]
  focusedIndex: number
  outletId: string | null
  isLoading: boolean
  setOutletId: (outletId: string) => void
  setFocusedIndex: (index: number) => void
  fetchOrders: () => Promise<void>
  subscribe: (outletId: string) => () => void
  bumpOrder: (id: string) => Promise<void>
}

function mapJoinRow(item: KdsJoinRow): KdsOrderItem {
  return {
    id: item.id,
    status: item.status,
    modifiers: item.modifiers ?? {},
    fired_at: item.fired_at,
    order_id: item.order_id,
    table_number: item.orders?.tables?.table_number ?? null,
    menu_items: item.menu_items,
  }
}

async function enrichOrderItem(
  itemId: string
): Promise<KdsOrderItem | null> {
  const { data } = await supabase
    .from('order_items')
    .select(
      `
      id,
      status,
      modifiers,
      fired_at,
      order_id,
      menu_items ( name ),
      orders (
        outlet_id,
        tables ( table_number )
      )
    `
    )
    .eq('id', itemId)
    .single()

  if (!data) return null
  return mapJoinRow(data as unknown as KdsJoinRow)
}

export const useKdsStore = create<KdsState>((set, get) => ({
  orders: [],
  focusedIndex: 0,
  outletId: null,
  isLoading: true,
  setOutletId: (outletId) => set({ outletId }),
  setFocusedIndex: (index) => set({ focusedIndex: index }),
  fetchOrders: async () => {
    const { outletId } = get()
    if (!outletId) return

    set({ isLoading: true })

    const { data: outletOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('outlet_id', outletId)
      .is('closed_at', null)

    const orderIds = outletOrders?.map((o) => o.id) ?? []

    if (orderIds.length === 0) {
      set({ orders: [], isLoading: false })
      return
    }

    const { data } = await supabase
      .from('order_items')
      .select(
        `
        id,
        status,
        modifiers,
        fired_at,
        order_id,
        menu_items ( name ),
        orders (
          outlet_id,
          tables ( table_number )
        )
      `
      )
      .in('order_id', orderIds)
      .in('status', ['NEW', 'PREPARING'])
      .order('fired_at', { ascending: true })

    if (data) {
      const enriched = (data as unknown as KdsJoinRow[]).map(mapJoinRow)
      set({ orders: enriched, isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },
  subscribe: (outletId: string) => {
    set({ outletId })

    get().fetchOrders()

    const subscription = supabase
      .channel(`kds-${outletId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const enriched = await enrichOrderItem(payload.new.id as string)
            if (
              enriched &&
              (enriched.status === 'NEW' || enriched.status === 'PREPARING')
            ) {
              const { data: orderCheck } = await supabase
                .from('orders')
                .select('outlet_id')
                .eq('id', enriched.order_id)
                .eq('outlet_id', outletId)
                .maybeSingle()

              if (orderCheck) {
                set((state) => ({
                  orders: [...state.orders, enriched].sort(
                    (a, b) =>
                      new Date(a.fired_at).getTime() -
                      new Date(b.fired_at).getTime()
                  ),
                }))
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status as ItemStatus
            if (newStatus === 'COMPLETED' || newStatus === 'READY') {
              set((state) => ({
                orders: state.orders.filter((o) => o.id !== payload.new.id),
                focusedIndex: Math.min(
                  state.focusedIndex,
                  Math.max(0, state.orders.length - 2)
                ),
              }))
            } else {
              set((state) => ({
                orders: state.orders.map((o) =>
                  o.id === payload.new.id
                    ? { ...o, status: newStatus }
                    : o
                ),
              }))
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  },
  bumpOrder: async (id: string) => {
    const { error } = await supabase
      .from('order_items')
      .update({
        status: 'COMPLETED',
        bumped_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (!error) {
      set((state) => ({
        orders: state.orders.filter((o) => o.id !== id),
        focusedIndex: Math.min(
          state.focusedIndex,
          Math.max(0, state.orders.length - 2)
        ),
      }))
    }
  },
}))
