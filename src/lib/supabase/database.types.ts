export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type TableDef<
  Row extends Record<string, unknown>,
  Insert extends Record<string, unknown>,
  Update extends Record<string, unknown>,
> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      organizations: TableDef<
        { id: string; name: string; created_at: string },
        { id?: string; name: string; created_at?: string },
        { id?: string; name?: string; created_at?: string }
      >
      properties: TableDef<
        {
          id: string
          organization_id: string
          name: string
          created_at: string
        },
        {
          id?: string
          organization_id: string
          name: string
          created_at?: string
        },
        {
          id?: string
          organization_id?: string
          name?: string
          created_at?: string
        }
      >
      outlets: TableDef<
        { id: string; property_id: string; name: string; created_at: string },
        {
          id?: string
          property_id: string
          name: string
          created_at?: string
        },
        {
          id?: string
          property_id?: string
          name?: string
          created_at?: string
        }
      >
      users: TableDef<
        {
          id: string
          organization_id: string
          outlet_id: string | null
          role: 'WAITER' | 'KDS' | 'CASHIER' | 'MANAGER'
          pin_hash: string
          created_at: string
        },
        {
          id?: string
          organization_id: string
          outlet_id?: string | null
          role: 'WAITER' | 'KDS' | 'CASHIER' | 'MANAGER'
          pin_hash: string
          created_at?: string
        },
        {
          id?: string
          organization_id?: string
          outlet_id?: string | null
          role?: 'WAITER' | 'KDS' | 'CASHIER' | 'MANAGER'
          pin_hash?: string
          created_at?: string
        }
      >
      menu_items: TableDef<
        {
          id: string
          outlet_id: string
          name: string
          price: number
          cgst_rate: number
          sgst_rate: number
          is_low_stock: boolean
          created_at: string
        },
        {
          id?: string
          outlet_id: string
          name: string
          price: number
          cgst_rate?: number
          sgst_rate?: number
          is_low_stock?: boolean
          created_at?: string
        },
        {
          id?: string
          outlet_id?: string
          name?: string
          price?: number
          cgst_rate?: number
          sgst_rate?: number
          is_low_stock?: boolean
          created_at?: string
        }
      >
      tables: TableDef<
        {
          id: string
          outlet_id: string
          table_number: number
          status: 'FREE' | 'OCCUPIED' | 'SENT' | 'PAID'
          updated_at: string
        },
        {
          id?: string
          outlet_id: string
          table_number: number
          status?: 'FREE' | 'OCCUPIED' | 'SENT' | 'PAID'
          updated_at?: string
        },
        {
          id?: string
          outlet_id?: string
          table_number?: number
          status?: 'FREE' | 'OCCUPIED' | 'SENT' | 'PAID'
          updated_at?: string
        }
      >
      orders: TableDef<
        {
          id: string
          table_id: string
          outlet_id: string
          manager_approval_required: boolean
          manager_approved: boolean
          payment_method: string | null
          split_count: number
          created_at: string
          closed_at: string | null
        },
        {
          id?: string
          table_id: string
          outlet_id: string
          manager_approval_required?: boolean
          manager_approved?: boolean
          payment_method?: string | null
          split_count?: number
          created_at?: string
          closed_at?: string | null
        },
        {
          id?: string
          table_id?: string
          outlet_id?: string
          manager_approval_required?: boolean
          manager_approved?: boolean
          payment_method?: string | null
          split_count?: number
          created_at?: string
          closed_at?: string | null
        }
      >
      order_items: TableDef<
        {
          id: string
          order_id: string
          menu_item_id: string
          status: 'NEW' | 'PREPARING' | 'READY' | 'COMPLETED'
          modifiers: Json
          split_group: number
          fired_at: string
          bumped_at: string | null
        },
        {
          id?: string
          order_id: string
          menu_item_id: string
          status?: 'NEW' | 'PREPARING' | 'READY' | 'COMPLETED'
          modifiers?: Json
          split_group?: number
          fired_at?: string
          bumped_at?: string | null
        },
        {
          id?: string
          order_id?: string
          menu_item_id?: string
          status?: 'NEW' | 'PREPARING' | 'READY' | 'COMPLETED'
          modifiers?: Json
          split_group?: number
          fired_at?: string
          bumped_at?: string | null
        }
      >
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: 'WAITER' | 'KDS' | 'CASHIER' | 'MANAGER'
      table_status: 'FREE' | 'OCCUPIED' | 'SENT' | 'PAID'
      item_status: 'NEW' | 'PREPARING' | 'READY' | 'COMPLETED'
    }
  }
}
