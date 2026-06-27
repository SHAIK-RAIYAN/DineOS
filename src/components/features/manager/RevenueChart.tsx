'use client'

import { useEffect, useRef } from 'react'

import { formatINR } from '@/lib/utils'
import {
  Bar,
  BarChart,
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
      
      <div ref={scrollRef} className="h-[350px] w-full overflow-x-auto">
        <div style={{ minWidth: `${Math.max(100, (data.length / 7) * 100)}%`, height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
              dy={10}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#6366f1"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6366f1', fontSize: 12, fontWeight: 700 }}
              tickFormatter={(value) => `₹${value}`}
              dx={-10}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#10b981', fontSize: 12, fontWeight: 700 }}
              dx={10}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                border: 'none',
                color: '#fff',
                fontWeight: 'bold',
                padding: '12px',
              }}
              itemStyle={{ fontWeight: 900 }}
              formatter={(value: any, name: any) => {
                if (name === 'revenue') return [formatINR(Number(value)), 'Revenue']
                if (name === 'orders') return [value, 'Orders']
                return [value, name]
              }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', fontSize: '12px' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }}
              formatter={(value) => <span className="text-slate-600">{value}</span>}
            />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              name="revenue"
              fill="#6366f1"
              radius={[6, 6, 0, 0]}
              barSize={32}
            />
            <Bar
              yAxisId="right"
              dataKey="orders"
              name="orders"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
