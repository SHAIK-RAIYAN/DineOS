"use client";

import { HoverExpandGallery } from "@/components/UI/HoverExpandGallery";
import PricingSection from "@/components/UI/PremiumPricing";

import { SplashHeader } from "@/components/UI/SpashHeader";
import { Footer } from "@/components/UI/Footer";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import ChefIcon from "../../public/Icons/chef";

export default function RootIndex() {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const { scrollY } = useScroll();
  const heroBgY = useTransform(scrollY, [0, 1000], [0, 400]);
  const heroTextY = useTransform(scrollY, [0, 800], [0, 200]);

  const fadeUpY = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <main className="selection:bg-yellow-900 selection:text-white min-h-screen bg-[#0A0A0A] selection:bg-[#C5A880] selection:text-[#0A0A0A] font-sans overflow-x-hidden text-[#FAF9F6]">
      <section
        id="Home"
        className="relative w-full h-screen min-h-[800px]  flex flex-col items-center justify-center overflow-hidden">
        <SplashHeader />

        <motion.div
          style={{ y: heroBgY }}
          className="absolute inset-0 z-0 opacity-40">
          <Image
            src="/images/dining5.webp"
            alt="DineOS Royal Atmosphere"
            fill
            className="object-cover object-center grayscale-[50%]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/80 via-transparent to-[#0A0A0A]" />
        </motion.div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="mb-6">
            <div className="flex gap-2 items-center">
              <div className="size-2 bg-white rounded-full" />
              <span className="text-white font-sans tracking-[0.2em] uppercase text-sm font-semibold">
                Excellence
              </span>
              <div className="size-2 bg-white rounded-full" />
              <span className="text-white font-sans tracking-[0.2em] uppercase text-sm font-semibold">
                Precision
              </span>
              <div className="size-2 bg-white rounded-full" />
              <span className="text-white font-sans tracking-[0.2em] uppercase text-sm font-semibold">
                Performance
              </span>
              <div className="size-2 bg-white rounded-full" />
            </div>
          </motion.div>

          <motion.h2
            style={{ y: heroTextY }}
            initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-garamond font-semibold tracking-tight text-[#FAF9F6] leading-[1.1] max-w-5xl">
            Designed for{" "}
            <span className="text-[#C5A880] italic">Restaurants</span> That
            Define <span className="text-[#C5A880] italic"> Excellence.</span>
          </motion.h2>
        </div>
      </section>

      <section
        ref={containerRef}
        className="py-32 bg-[#FAF9F6] text-[#0A0A0A] relative z-20 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            style={{ y: fadeUpY }}
            className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
            <h2 className="text-4xl md:text-6xl font-garamond font-bold leading-none max-w-2xl">
              Flawless Execution Across Every Surface.
            </h2>
            <p className="text-[#5A5A5A] font-sans text-lg max-w-md leading-relaxed">
              Eliminate latency. Our decentralized sync engine ensures your
              entire floor operates on a single source of truth.
            </p>
          </motion.div>

          <HoverExpandGallery />
        </div>
      </section>

      <section
        id="premium"
        className="py-40 rounded-t-[3rem] -mt-10 z-20 bg-[#0D1C04] relative border-t border-[#222222]">
        <PricingSection />
      </section>

      <Footer />
    </main>
  );
}
