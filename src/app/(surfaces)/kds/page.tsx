"use client";

import { TicketBoard } from "@/components/features/kds/TicketBoard";
import { TotalCookSummary } from "@/components/features/kds/TotalCookSummary";
import { SurfaceHeader } from "@/components/UI/SurfaceHeader";
import { DEFAULT_OUTLET_ID } from "@/lib/constants";
import { useKdsStore } from "@/store/useKdsStore";
import { Keyboard } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

export default function KDS() {
  const [now, setNow] = useState(new Date());
  const {
    orders,
    focusedIndex,
    setFocusedIndex,
    subscribe,
    bumpOrder,
    isLoading,
  } = useKdsStore();
  const [isOnline, setIsOnline] = useState(true);

  // groupedOrders removed

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const cleanup = subscribe(DEFAULT_OUTLET_ID);
    return cleanup;
  }, [subscribe]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "9") {
        const index = parseInt(e.key, 10) - 1;
        if (index < orders.length) {
          setFocusedIndex(index);
        }
      }
      if (e.key === " " && orders.length > 0) {
        e.preventDefault();
        const target = orders[focusedIndex];
        if (target) bumpOrder(target.id);
      }
      if (e.key === "ArrowRight" && orders.length > 0) {
        setFocusedIndex(Math.min(focusedIndex + 1, orders.length - 1));
      }
      if (e.key === "ArrowLeft" && orders.length > 0) {
        setFocusedIndex(Math.max(focusedIndex - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [orders, focusedIndex, setFocusedIndex, bumpOrder]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
      <SurfaceHeader surfaceName="KDS" isOnline={isOnline} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.1,
            type: "spring",
            stiffness: 300,
            damping: 24,
          }}
          className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 bg-white border-b border-slate-200 gap-4 shadow-sm z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              Ticket Board
            </h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-500 border border-slate-200">
              <Keyboard className="w-4 h-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest hidden md:block">
                Space: Done • 1-9: Select • Arrows: Navigate
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest md:hidden">
                Tap ticket to select, button to bump
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-[11px] font-black text-indigo-700 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm">
              {isLoading ? "Syncing..." : `${orders.length} Active Tickets`}
            </span>
          </div>
        </motion.header>

        <section className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-6" data-lenis-prevent>
            <TicketBoard
              orders={orders}
              now={now}
              focusedIndex={focusedIndex}
              onBump={bumpOrder}
              onFocus={setFocusedIndex}
            />
          </div>
          <TotalCookSummary orders={orders} />
        </section>
      </div>
    </motion.main>
  );
}
