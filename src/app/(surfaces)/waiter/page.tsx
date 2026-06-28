"use client";

import { ActiveOrderTray } from "@/components/features/waiter/ActiveOrderTray";
import { FloorPlanGrid } from "@/components/features/waiter/FloorPlanGrid";
import { MenuCatalog } from "@/components/features/waiter/MenuCatalog";
import { SentItemsList } from "@/components/features/waiter/SentItemsList";
import { DEFAULT_OUTLET_ID } from "@/lib/constants";
import { useWaiterStore } from "@/store/useWaiterStore";
import type { SyncConflict } from "@/types";
import { SurfaceHeader } from "@/components/UI/SurfaceHeader";
import { motion, type Variants } from "motion/react";
import { useCallback, useEffect } from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function WaiterSurface() {
  const {
    isOnline,
    setOnlineStatus,
    offlineQueue,
    clearOfflineQueue,
    removeFromOfflineQueue,
    resetTableSession,
    clearCart,
  } = useWaiterStore();

  const flushOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0 || !navigator.onLine) return;

    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mutations: offlineQueue,
          outletId: DEFAULT_OUTLET_ID,
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        processed: string[];
        conflicts: SyncConflict[];
      };

      if (result.processed) {
        result.processed.forEach((id) => removeFromOfflineQueue(id));
      }

      if (result.conflicts && result.conflicts.length > 0) {
        result.conflicts.forEach((conflict) => {
          offlineQueue
            .filter(
              (m) => m.type === "FIRE_ORDER" && m.tableId === conflict.tableId,
            )
            .forEach((m) => removeFromOfflineQueue(m.id));
        });
        resetTableSession();
        clearCart();
      }

      if (result.success && result.processed.length === offlineQueue.length) {
        clearOfflineQueue();
      }
    } catch (error) {
      console.error("Failed to sync offline queue:", error);
      // Do not manually retry client-side insertions here.
      // Leave the items in the offlineQueue for the next attempt.
    }
  }, [
    offlineQueue,
    clearOfflineQueue,
    removeFromOfflineQueue,
    resetTableSession,
    clearCart,
  ]);

  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      flushOfflineQueue();
    };
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnlineStatus, flushOfflineQueue]);

  return (
    <motion.main
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-slate-50 flex flex-col w-full mx-auto relative font-medium text-slate-900">
      <SurfaceHeader 
        surfaceName="Waiter" 
        isOnline={isOnline} 
        offlineQueueLength={offlineQueue.length} 
      />

      <section className="flex-1 overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          <div
            className="p-3 flex-1 lg:border-r border-slate-200 flex flex-col min-h-0 relative pb-32 overflow-y-auto"
            data-lenis-prevent>
            <motion.div variants={itemVariants} className="shrink-0">
              <h2 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">
                Active Zones
              </h2>
              <FloorPlanGrid outletId={DEFAULT_OUTLET_ID} />
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="mt-8 flex-1 flex flex-col min-h-0">
              <SentItemsList />
            </motion.div>

            <ActiveOrderTray outletId={DEFAULT_OUTLET_ID} />
          </div>
          <motion.div
            variants={itemVariants}
            className="p-3 lg:w-[380px] bg-white border-t lg:border-t-0 border-slate-200 flex flex-col h-[calc(100vh-48px)] sticky top-[48px]">
            <h2 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3 shrink-0">
              Menu Catalog
            </h2>
            <div className="flex-1 overflow-y-auto pr-2" data-lenis-prevent>
              <MenuCatalog outletId={DEFAULT_OUTLET_ID} />
            </div>
          </motion.div>
        </div>
      </section>
    </motion.main>
  );
}
