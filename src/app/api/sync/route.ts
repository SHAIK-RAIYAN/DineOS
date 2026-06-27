import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import type { OfflineMutation, SyncConflict } from '@/types'

type SyncRequestBody = {
  mutations: OfflineMutation[]
  outletId: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SyncRequestBody
    const { mutations, outletId } = body

    if (!mutations || !Array.isArray(mutations) || mutations.length === 0) {
      return NextResponse.json(
        { success: true, processed: [], conflicts: [] },
        { status: 200 }
      )
    }

    const processed: string[] = []
    const conflicts: SyncConflict[] = []

    for (const mutation of mutations) {
      if (mutation.type === 'FIRE_ORDER') {
        const { data: orderData } = await supabaseAdmin
          .from('orders')
          .select('id, closed_at, table_id')
          .eq('table_id', mutation.tableId)
          .is('closed_at', null)
          .maybeSingle()

        if (!orderData) {
          conflicts.push({
            tableId: mutation.tableId,
            reason: 'TABLE_CLOSED',
          })
          continue
        }

        const insertPayload = mutation.items.map((item) => ({
          order_id: mutation.orderId,
          menu_item_id: item.menu_item_id,
          modifiers: item.modifiers,
          status: 'NEW' as const,
        }))

        const { error: itemsError } = await supabaseAdmin
          .from('order_items')
          .insert(insertPayload)

        if (itemsError) {
          conflicts.push({
            tableId: mutation.tableId,
            reason: 'TABLE_NOT_FOUND',
          })
          continue
        }

        await supabaseAdmin
          .from('tables')
          .update({ status: 'SENT', updated_at: new Date().toISOString() })
          .eq('id', mutation.tableId)
          .eq('outlet_id', outletId)

        processed.push(mutation.id)
      } else if (mutation.type === 'OPEN_TABLE') {
        const { data: tableData } = await supabaseAdmin
          .from('tables')
          .select('id, status')
          .eq('id', mutation.tableId)
          .maybeSingle()

        if (!tableData || tableData.status === 'FREE') {
          await supabaseAdmin.from('orders').insert({
            id: mutation.orderId,
            table_id: mutation.tableId,
            outlet_id: outletId,
          })

          await supabaseAdmin
            .from('tables')
            .update({
              status: 'OCCUPIED',
              updated_at: new Date().toISOString(),
            })
            .eq('id', mutation.tableId)

          processed.push(mutation.id)
        } else {
          const { data: existingOrder } = await supabaseAdmin
            .from('orders')
            .select('id, closed_at')
            .eq('table_id', mutation.tableId)
            .is('closed_at', null)
            .maybeSingle()

          if (!existingOrder) {
            conflicts.push({
              tableId: mutation.tableId,
              reason: 'TABLE_CLOSED',
            })
          } else {
            processed.push(mutation.id)
          }
        }
      }
    }

    return NextResponse.json({
      success: conflicts.length === 0,
      processed,
      conflicts,
    })
  } catch {
    return NextResponse.json(
      { success: false, processed: [], conflicts: [], error: 'Sync failed' },
      { status: 500 }
    )
  }
}
