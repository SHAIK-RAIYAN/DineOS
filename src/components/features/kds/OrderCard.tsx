"use client";

import { cn } from "@/lib/utils";
import type { KdsOrderItem } from "@/types";
import { differenceInMinutes, formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";
import { motion } from "motion/react";

type OrderCardProps = {
  order: KdsOrderItem;
  now: Date;
  isFocused: boolean;
  onBump: (id: string) => void;
  onFocus: () => void;
};

function getAgingBorder(minsElapsed: number): string {
  if (minsElapsed >= 10) return "border-t-red-600";
  if (minsElapsed >= 5) return "border-t-yellow-500";
  return "border-t-slate-900";
}

function getAgingText(minsElapsed: number): string {
  if (minsElapsed >= 10) return "text-red-600";
  if (minsElapsed >= 5) return "text-yellow-600";
  return "text-slate-500";
}

export function OrderCard({
  order,
  now,
  isFocused,
  onBump,
  onFocus,
}: OrderCardProps) {
  const firedAt = new Date(order.fired_at);
  const minsElapsed = differenceInMinutes(now, firedAt);
  const agingBorder = getAgingBorder(minsElapsed);
  const agingText = getAgingText(minsElapsed);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={onFocus}
      className={cn(
        "flex flex-col justify-between w-full min-h-[320px] bg-white rounded-[2rem] overflow-hidden border-x border-b border-t-8 border-slate-200 cursor-pointer shadow-sm hover:shadow-xl transition-all",
        agingBorder,
        isFocused &&
          "ring-4 ring-slate-900 ring-offset-4 ring-offset-slate-50 shadow-2xl scale-[1.02]",
      )}>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-2">
            {order.table_number && (
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Table {order.table_number}
              </span>
            )}
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 text-sm font-black",
              agingText,
            )}>
            <Clock className="w-4 h-4" />
            {formatDistanceToNow(firedAt, { addSuffix: true })}
          </div>
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-4 leading-tight">
          {order.menu_items?.name ?? "Unknown Item"}
        </h2>

        {order.modifiers && Object.keys(order.modifiers).length > 0 && (
          <div className="mt-2 pt-4 border-t border-slate-100 flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Modifiers & Notes
            </p>
            <ul className="space-y-2">
              {Object.entries(order.modifiers).map(([key, value]) => {
                if (key === "Custom Note") {
                  return (
                    <li
                      key={key}
                      className="text-sm font-black text-red-800 bg-red-50 p-3 rounded-xl border border-red-100">
                      <span className="uppercase text-[9px] tracking-widest block text-red-500 mb-1">
                        Special Instructions
                      </span>
                      {String(value)}
                    </li>
                  );
                }

                return (
                  <li
                    key={key}
                    className="text-xs font-bold text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-2">
                    <span className="text-slate-400 font-black">•</span>
                    <span className="capitalize">{key.replace(/_/g, " ")}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onBump(order.id);
        }}
        className="w-full py-5 bg-slate-900 hover:bg-black active:bg-slate-800 text-white font-black text-xl uppercase tracking-widest flex items-center justify-center transition-colors"
        aria-label={`BUMP ${order.menu_items?.name}`}>
        DONE
      </button>
    </motion.div>
  );
}
