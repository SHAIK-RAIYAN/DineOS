"use client";

import { SplashHeader } from "@/components/UI/SpashHeader";
import { Footer } from "@/components/UI/Footer";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function InvestorsPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F6] selection:bg-[#C5A880] selection:text-white font-sans text-[#0A0A0A] flex flex-col">
      <SplashHeader />

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-32 mt-20 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C5A880]/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
          
          <h1 className="text-5xl md:text-8xl font-garamond font-bold tracking-tight">
            Investors
          </h1>
          
          <div className="space-y-4">
            <h2 className="text-2xl md:text-4xl font-garamond font-semibold text-[#5A5A5A] italic">
              No Current Investors.
            </h2>
            <p className="text-xl font-sans uppercase tracking-[0.2em] font-bold text-[#C5A880]">
              DineOS is proudly bootstrapped.
            </p>
          </div>

          <p className="text-[#888888] font-sans text-lg leading-relaxed max-w-xl mx-auto pt-4">
            We believe in answering only to our customers. By remaining independent, we have the freedom to build the perfect hospitality operating system without the pressure of outside capital.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 border border-[#E5E5E5] hover:border-[#C5A880] text-[#0A0A0A] hover:text-[#C5A880] rounded-full transition-all duration-300 font-sans uppercase tracking-[0.1em] text-xs font-bold bg-white hover:bg-[#FAF9F6] shadow-sm group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return Home
          </Link>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
