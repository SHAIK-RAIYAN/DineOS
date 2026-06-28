"use client";

import { SplashHeader } from "@/components/UI/SpashHeader";
import { Footer } from "@/components/UI/Footer";
import { motion } from "motion/react";
import ChefIcon from "../../../public/Icons/chef";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SubscriptionPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] selection:bg-[#C5A880] selection:text-[#0A0A0A] font-sans text-[#FAF9F6] flex flex-col">
      <SplashHeader />

      <section className="flex-1 flex flex-col items-center justify-center relative px-6 py-32 mt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C5A880]/10 via-[#0A0A0A] to-[#0A0A0A] opacity-50" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-8">
          <ChefIcon className="size-24 text-[#C5A880]" />
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-garamond font-bold tracking-tight text-[#FAF9F6]">
              Subscriptions
            </h1>
            <p className="text-[#C5A880] font-sans text-xl uppercase tracking-[0.2em] font-semibold">
              Coming Soon
            </p>
          </div>

          <p className="text-[#888888] font-sans text-lg leading-relaxed max-w-lg mx-auto">
            We are currently refining our multi-tenant billing infrastructure to provide you with the most seamless experience possible. 
            <br/><br/>
            Check back soon or contact our sales team to arrange a bespoke deployment.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 border border-[#333333] hover:border-[#C5A880] text-[#FAF9F6] hover:text-[#C5A880] rounded-full transition-all duration-300 font-sans uppercase tracking-[0.1em] text-xs font-bold bg-[#111111] hover:bg-transparent group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return Home
          </Link>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
