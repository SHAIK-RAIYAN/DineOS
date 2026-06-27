export type UserRole = 'WAITER' | 'KDS' | 'CASHIER' | 'MANAGER'

export type TableStatus = 'FREE' | 'OCCUPIED' | 'SENT' | 'PAID'

export type ItemStatus = 'NEW' | 'PREPARING' | 'READY' | 'COMPLETED'

export type ModifierMap = Record<string, boolean | string>

export type CartItem = {
  id: string
  menu_item_id: string
  menu_item_name: string
  price: number
  modifiers: ModifierMap
}

export type OfflineMutation =
  | {
      id: string
      type: 'FIRE_ORDER'
      tableId: string
      orderId: string
      outletId: string
      items: Array<{
        menu_item_id: string
        modifiers: ModifierMap
      }>
    }
  | {
      id: string
      type: 'OPEN_TABLE'
      tableId: string
      outletId: string
      orderId: string
    }

export type SyncConflict = {
  tableId: string
  reason: 'TABLE_CLOSED' | 'TABLE_NOT_FOUND'
}

export type GstBreakdown = {
  subtotal: number
  cgst: number
  sgst: number
  total: number
}

export type KdsOrderItem = {
  id: string
  status: ItemStatus
  modifiers: ModifierMap
  fired_at: string
  order_id: string
  table_number: number | null
  menu_items: { name: string } | null
}

export type OutletMetrics = {
  outlet_id: string
  outlet_name: string
  revenue: number
  active_tables: number
  completed_items: number
}

export type TopMovingItem = {
  menu_item_id: string
  name: string
  count: number
  outlet_id: string
}

export type PendingApproval = {
  id: string
  table_id: string
  table_number: number
  outlet_id: string
  manager_approval_required: boolean
  manager_approved: boolean
}
