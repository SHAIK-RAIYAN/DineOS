"use client";

import { Footer } from "@/components/UI/Footer";
import { SplashHeader } from "@/components/UI/SpashHeader";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import ChefIcon from "../../../public/Icons/chef";

export default function AboutPage() {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const fadeUpY = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <main className="min-h-screen  selection:bg-[#C5A880] selection:text-[#0A0A0A] font-sans text-[#FAF9F6] flex flex-col overflow-x-hidden">
      <SplashHeader />

      {/* Hero Section */}
      <section className="relative bg-[#0A0A0A] w-full h-screen min-h-[700px] flex flex-col items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0">
          <Image
            src="/images/restaurant.webp"
            alt="DineOS Royal Atmosphere"
            fill
            className="object-cover object-center grayscale-[30%]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/80 via-[#0A0A0A]/40 to-[#0A0A0A]" />
        </motion.div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="mb-6 flex flex-col items-center">
            <ChefIcon className="size-16 text-[#C5A880] mb-6" />
            <h1 className="text-5xl md:text-8xl font-garamond font-bold tracking-tight text-[#FAF9F6] leading-[1.1]">
              The Story of <span className="text-[#C5A880] italic">DineOS</span>
              .
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-2xl text-[#888888] font-sans max-w-3xl mt-4">
            Forged by a single developer, designed for the future of hospitality. A comprehensive portfolio project showcasing modern web architecture.
          </motion.p>
        </div>
      </section>

      {/* Story Content */}
      <section
        ref={containerRef}
        className="py-32 bg-[#0F1E05] text-[#D5D59C] relative z-20 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            style={{ y: fadeUpY }}
            className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-6xl font-garamond font-bold leading-none">
                Born out of frustration. Built for scale.
              </h2>
              <div className="space-y-6 text-[#DCDCDA] font-sans text-lg leading-relaxed">
                <p>
                  DineOS is currently a robust sample project built entirely by <strong>Shaik Raiyan</strong>. It was created to demonstrate how modern web technologies can solve complex, real-world synchronization problems in the restaurant industry.
                </p>
                <p>
                  While not yet a fully commercialized product, it features a complete suite of tools: a <strong>POS Terminal</strong> for cashiers, a real-time <strong>KDS Engine</strong> for the kitchen, an interactive <strong>Waiter Module</strong> with floorplan routing, and a comprehensive <strong>Manager Dashboard</strong>.
                </p>
              </div>
            </div>
            <div className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/images/Chef.webp"
                alt="Chef using DineOS"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

          <div className="mt-40 grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="relative h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl order-2 md:order-1">
              <Image
                src="/images/dining1.webp"
                alt="Elegant Dining Room"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-8 order-1 md:order-2">
              <h2 className="text-4xl md:text-6xl font-garamond font-bold leading-none">
                Powered by modern <span className="text-[#C5A880] italic">architecture</span>.
              </h2>
              <div className="space-y-6 text-[#DCDCDA] font-sans text-lg leading-relaxed">
                <p>
                  Under the hood, DineOS is powered by a powerful stack designed for scale and speed. The backend utilizes <strong>Supabase</strong> and <strong>PostgreSQL</strong> for robust data integrity and relational schema management.
                </p>
                <p>
                  Crucially, the entire system relies on <strong>WebSockets</strong> to provide instantaneous, real-time synchronization across all devices. When a waiter fires an order, it appears on the kitchen display in milliseconds, showcasing a seamless, decentralized flow of data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
