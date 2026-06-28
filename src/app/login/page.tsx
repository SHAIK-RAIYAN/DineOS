"use client";

import { ChefHat, MonitorDot, Receipt, UtensilsCrossed } from "lucide-react";
import { motion, type Variants } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import ChefIcon from "../../../public/Icons/chef";

const roles = [
  {
    title: "Floor Waiter",
    description: "Take orders, manage tables, and fire tickets.",
    icon: <UtensilsCrossed className="w-6 h-6" />,
    href: "/waiter",
    image: "/images/waiter.webp",
  },
  {
    title: "Kitchen Display (KDS)",
    description: "Real-time order queue and ticket management.",
    icon: <ChefHat className="w-6 h-6" />,
    href: "/kds",
    image: "/images/chef2fire.webp",
  },
  {
    title: "Cashier Terminal",
    description: "Settle bills, split checks, and run reports.",
    icon: <Receipt className="w-6 h-6" />,
    href: "/cashier",
    image: "/images/cashier.webp",
  },
  {
    title: "Manager Dashboard",
    description: "Analytics, revenue tracking, and oversight.",
    icon: <MonitorDot className="w-6 h-6" />,
    href: "/manager",
    image: "/images/manager.webp",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function AuthPage() {
  return (
    <div className="min-h-screen lg:max-h-screen bg-[#FAF9F6] text-[#0A0A0A] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden selection:bg-[#C5A880] selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C5A880]/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-7xl space-y-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <ChefIcon className="w-16 h-16 text-[#C5A880]" />
          </div>
          <h1 className="text-5xl md:text-7xl font-garamond font-bold text-[#0A0A0A] tracking-tight">
            Select Workspace
          </h1>
          <p className="text-[#5A5A5A] text-md max-w-xl mx-auto font-sans">
            Authentication bypassed for demo. Select a role below to launch the
            surface.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => (
            <motion.div
              key={role.href}
              variants={itemVariants}
              className="h-full">
              <Link
                href={role.href}
                className="group relative flex flex-col h-[480px] rounded-[2rem] overflow-hidden border border-[#222222] bg-[#111111] transition-colors hover:border-[#C5A880]/50 shadow-sm hover:shadow-xl">
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <Image
                    src={role.image}
                    alt={role.title}
                    fill
                    className="object-cover object-center opacity-80 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:opacity-100"
                  />
                  {/* Small mask from bottom to middle */}
                  <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                </div>

                <div className="relative z-10 flex flex-col h-full p-6 justify-end">
                  <div className="flex flex-col mt-auto">
                    <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 text-[#C5A880] group-hover:bg-[#C5A880] group-hover:text-[#0A0A0A] group-hover:border-[#C5A880] transition-colors shadow-sm">
                      {role.icon}
                    </div>
                    <h3 className="text-2xl font-garamond font-bold mb-2 text-white">
                      {role.title}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed font-sans mb-6">
                      {role.description}
                    </p>

                    <div className="px-6 py-3 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest text-gray-200 group-hover:text-[#0A0A0A] group-hover:bg-[#C5A880] group-hover:border-[#C5A880] transition-all text-center">
                      Launch
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center pt-8">
          <Link
            href="/"
            className="text-sm text-[#5A5A5A] hover:text-[#C5A880] transition-colors border-b border-transparent hover:border-[#C5A880] pb-0.5 uppercase tracking-widest font-bold">
            ← Return to Landing Page
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
