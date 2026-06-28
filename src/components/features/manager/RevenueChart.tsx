'use client'

import { useEffect, useRef } from 'react'

import { formatINR } from '@/lib/utils'
import {
  Bar,
  Area,
  ComposedChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type RevenueData = {
  date: string
  revenue: number
  orders: number
}

type RevenueChartProps = {
  data: RevenueData[]
  isLoading?: boolean
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 min-h-[400px] flex items-center justify-center">
        <span className="text-slate-400 font-bold uppercase tracking-widest">
          Loading Chart...
        </span>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 min-h-[400px] flex items-center justify-center">
        <span className="text-slate-400 font-bold uppercase tracking-widest">
          No data available
        </span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">
            Daily Revenue & Volume
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">
            Historical Data
          </p>
        </div>
      </div>
      
      <div ref={scrollRef} className="h-[350px] w-full overflow-x-auto" data-lenis-prevent>
        <div style={{ minWidth: `${Math.max(100, (data.length / 7) * 100)}%`, height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 800 }}
              dy={15}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#6366f1"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6366f1', fontSize: 12, fontWeight: 900 }}
              tickFormatter={(value) => `₹${value}`}
              dx={-15}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#10b981', fontSize: 12, fontWeight: 900 }}
              dx={15}
            />
            <Tooltip
              cursor={{ fill: 'transparent', stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '4 4' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                color: '#0f172a',
                fontWeight: '900',
                padding: '16px',
              }}
              itemStyle={{ fontWeight: 900, textTransform: 'uppercase' }}
              formatter={(value: any, name: any) => {
                if (name === 'revenue') return [formatINR(Number(value)), 'Revenue']
                if (name === 'orders') return [value, 'Orders']
                return [value, name]
              }}
              labelStyle={{ color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontSize: '12px', fontWeight: 900 }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px', fontWeight: '900', textTransform: 'uppercase', fontSize: '12px' }}
              formatter={(value) => <span className="text-slate-900">{value}</span>}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              name="revenue"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Bar
              yAxisId="right"
              dataKey="orders"
              name="orders"
              fill="url(#colorOrders)"
              radius={[6, 6, 0, 0]}
              barSize={24}
            />
          </ComposedChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
