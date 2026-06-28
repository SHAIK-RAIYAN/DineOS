'use client'

import { formatINR } from '@/lib/utils'
import { TrendingUp, Users, CheckCircle2 } from 'lucide-react'
import type { OutletMetrics } from '@/types'
import NumberFlow from '@number-flow/react'

type CrossOutletMetricCardsProps = {
  outletMetrics: OutletMetrics[]
  totalRevenue: number
  totalActiveTables: number
  isLoading: boolean
}

export function CrossOutletMetricCards({
  outletMetrics,
  totalRevenue,
  totalActiveTables,
  isLoading,
}: CrossOutletMetricCardsProps) {
  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 flex items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">
              Total Revenue
            </p>
            <p className="text-4xl font-black text-slate-900 flex items-center">
              {isLoading ? '...' : <NumberFlow value={totalRevenue} format={{ style: 'currency', currency: 'INR' }} />}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 flex items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">
              Active Tables
            </p>
            <p className="text-4xl font-black text-slate-900">
              {isLoading ? '...' : <NumberFlow value={totalActiveTables} />}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {outletMetrics.map((outlet) => (
          <div
            key={outlet.outlet_id}
            className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-slate-900" />
              <h3 className="font-black text-slate-900 uppercase tracking-widest">
                {outlet.outlet_name}
              </h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Revenue</span>
                <span className="font-black text-slate-900 text-lg flex items-center">
                  <NumberFlow value={outlet.revenue} format={{ style: 'currency', currency: 'INR' }} />
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Active Tables</span>
                <span className="font-black text-slate-900 text-lg">
                  <NumberFlow value={outlet.active_tables} />
                </span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Items Served</span>
                <span className="font-black text-slate-900 text-lg">
                  <NumberFlow value={outlet.completed_items} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
