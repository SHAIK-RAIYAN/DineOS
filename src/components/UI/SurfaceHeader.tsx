import { Wifi, WifiOff } from "lucide-react";
import { motion, type Variants } from "motion/react";
import ChefIcon from "../../../public/Icons/chef";

interface SurfaceHeaderProps {
  surfaceName: string;
  isOnline?: boolean;
  offlineQueueLength?: number;
}

const itemVariants: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export function SurfaceHeader({
  surfaceName,
  isOnline = true,
  offlineQueueLength = 0,
}: SurfaceHeaderProps) {
  return (
    <motion.header
      variants={itemVariants}
      className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 min-h-[48px]">
      <div className="flex items-start gap-1">
        <ChefIcon className="w-6 h-6 text-slate-900" />
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 font-libre">
          DineOS
          <span className="text-[10px] font-black text-slate-50 bg-slate-900 px-2 py-0.5 rounded uppercase tracking-widest mt-0.5 ml-2">
            {surfaceName}
          </span>
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {offlineQueueLength > 0 && (
          <span className="text-[10px] font-bold text-slate-900 bg-slate-200 px-2 py-1 rounded-lg font-sans">
            {offlineQueueLength} queued
          </span>
        )}
        {isOnline ? (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-800 bg-green-100 px-2 py-1 rounded-lg font-sans">
            <Wifi className="w-3 h-3" />
            ONLINE
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-800 bg-red-100 px-2 py-1 rounded-lg font-sans">
            <WifiOff className="w-3 h-3" />
            OFFLINE
          </span>
        )}
      </div>
    </motion.header>
  );
}
