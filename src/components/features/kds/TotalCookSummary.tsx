"use client";

import type { KdsOrderItem } from "@/types";
import { Flame } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";

type TotalCookSummaryProps = {
  orders: KdsOrderItem[];
};

export function TotalCookSummary({ orders }: TotalCookSummaryProps) {
  const summary = useMemo(() => {
    const counts = orders.reduce(
      (acc, order) => {
        const name = order.menu_items?.name || "Unknown Item";
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Sort by count descending, then alphabetically
    return Object.entries(counts).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });
  }, [orders]);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-80 border-l mt-2 mr-2 border-slate-200 rounded-lg bg-neutral-200 flex flex-col h-full shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-10">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          Cook Summary
        </h2>
        <span className="text-[10px] font-black text-slate-50 bg-slate-900 px-2 py-1 rounded-lg">
          {orders.length} TOTAL
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2" data-lenis-prevent>
        <AnimatePresence mode="popLayout">
          {summary.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center p-6 text-slate-400">
              <p className="text-[10px] font-bold uppercase tracking-widest">
                No items to cook
              </p>
            </motion.div>
          ) : (
            summary.map(([name, count]) => (
              <motion.div
                key={name}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 text-sm">{name}</span>
                <span className="text-sm font-black text-slate-900 bg-white border border-slate-200 w-8 h-8 flex items-center justify-center rounded-lg shadow-sm">
                  {count}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
