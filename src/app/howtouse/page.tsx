"use client";

import { SplashHeader } from "@/components/UI/SpashHeader";
import { Footer } from "@/components/UI/Footer";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { Monitor, ChefHat, CreditCard, BarChart } from "lucide-react";
import { useRef } from "react";
import { SimulatorGuide } from "@/components/features/marketing/SimulatorGuide";

export default function HowToUsePage() {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const fadeUpY = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <main className="min-h-screen bg-[#0A0A0A] selection:bg-[#C5A880] selection:text-[#0A0A0A] font-sans text-[#FAF9F6] flex flex-col overflow-x-hidden">
      <SplashHeader />

      {/* Hero Section */}
      <section className="relative w-full h-screen min-h-[700px] flex flex-col items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0">
          <Image
            src="/images/dining3.webp"
            alt="DineOS Architecture"
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
            <h1 className="text-5xl md:text-8xl font-garamond font-bold tracking-tight text-[#FAF9F6] leading-[1.1]">
              The <span className="text-[#C5A880] italic">Symphony</span> of Service.
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-2xl text-[#888888] font-sans max-w-3xl mt-4">
            A frictionless ecosystem. Discover how DineOS unifies the Waiter, Chef, Cashier, and Manager in milliseconds.
          </motion.p>
        </div>
      </section>

      {/* The Scenario */}
      <section ref={containerRef} className="py-32 bg-[#FAF9F6] text-[#0A0A0A] relative z-20 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-garamond font-bold mb-6">The Perfect Order Flow</h2>
            <p className="text-xl text-[#5A5A5A] max-w-3xl mx-auto">
              DineOS removes the friction between front-of-house and back-of-house. Let's walk through a standard service scenario.
            </p>
          </div>

          {/* Waiter -> Chef */}
          <motion.div style={{ y: fadeUpY }} className="grid md:grid-cols-2 gap-16 md:gap-24 items-center mb-40">
            <div className="space-y-8">
              <div className="flex items-center gap-4 text-[#C5A880]">
                <Monitor className="w-8 h-8" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Step 1: The Floor</h3>
              </div>
              <h2 className="text-4xl md:text-5xl font-garamond font-bold leading-none">
                Instant Firing.
              </h2>
              <div className="space-y-6 text-[#5A5A5A] font-sans text-lg leading-relaxed">
                <p>
                  A guest takes a seat. The <strong>Waiter</strong> taps the table on their tablet, immediately marking it as occupied. They take the order, selecting items and applying custom modifiers.
                </p>
                <p>
                  The moment they press <em>Fire Order</em>, WebSockets broadcast the data. There is no refreshing, no waiting. The order is instantly injected into the kitchen's workflow.
                </p>
              </div>
            </div>
            <div className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-2xl">
              <Image src="/images/waiter.webp" alt="Waiter" fill className="object-cover" />
            </div>
          </motion.div>

          {/* Chef -> Waiter */}
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center mb-40">
            <div className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-2xl order-2 md:order-1">
              <Image src="/images/Chef.webp" alt="Chef" fill className="object-cover" />
            </div>
            <div className="space-y-8 order-1 md:order-2">
              <div className="flex items-center gap-4 text-[#C5A880]">
                <ChefHat className="w-8 h-8" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Step 2: The Kitchen</h3>
              </div>
              <h2 className="text-4xl md:text-5xl font-garamond font-bold leading-none">
                Precision Cooking.
              </h2>
              <div className="space-y-6 text-[#5A5A5A] font-sans text-lg leading-relaxed">
                <p>
                  The <strong>Chef</strong> sees the new ticket populate on the Kitchen Display System (KDS) with a live running timer. They begin prepping.
                </p>
                <p>
                  Once the dish is cooked, the chef taps <em>Done</em>. Instantly, the Waiter's tablet updates, shifting the item status to Completed, signaling that the food is ready to be run to the table.
                </p>
              </div>
            </div>
          </div>

          {/* Waiter -> Cashier */}
          <motion.div style={{ y: fadeUpY }} className="grid md:grid-cols-2 gap-16 md:gap-24 items-center mb-40">
            <div className="space-y-8">
              <div className="flex items-center gap-4 text-[#C5A880]">
                <CreditCard className="w-8 h-8" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Step 3: The Register</h3>
              </div>
              <h2 className="text-4xl md:text-5xl font-garamond font-bold leading-none">
                Seamless Checkout.
              </h2>
              <div className="space-y-6 text-[#5A5A5A] font-sans text-lg leading-relaxed">
                <p>
                  The guests finish their meal and head to the reception. The <strong>Cashier</strong> doesn't need to ask for a ticket. They pull up the active table and see the perfectly synchronized bill.
                </p>
                <p>
                  Using the advanced Bill Splitter, the cashier can divide the check equally or by custom amounts. Once settled, the table is freed globally.
                </p>
              </div>
            </div>
            <div className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-2xl">
              <Image src="/images/cashier.webp" alt="Cashier" fill className="object-cover" />
            </div>
          </motion.div>

          {/* Everything -> Manager */}
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="relative  h-[500px] w-[450px] left-20 rounded-3xl overflow-hidden shadow-2xl order-2 md:order-1">
              <Image src="/images/manager.webp" alt="Manager" fill className="object-cover" />
            </div>
            <div className="space-y-8 order-1 md:order-2">
              <div className="flex items-center gap-4 text-[#C5A880]">
                <BarChart className="w-8 h-8" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Step 4: The Office</h3>
              </div>
              <h2 className="text-4xl md:text-5xl font-garamond font-bold leading-none">
                Omnipresent Control.
              </h2>
              <div className="space-y-6 text-[#5A5A5A] font-sans text-lg leading-relaxed">
                <p>
                  Behind the scenes, the <strong>Manager</strong> is watching the entire restaurant breathe. Every fired order, completed dish, and settled check hits the Manager Dashboard with sub-second latency.
                </p>
                <p>
                  Revenue charts spike in real-time, and live metrics reflect the exact heartbeat of the floor, empowering management to make instantaneous, data-driven decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SimulatorGuide />

      <Footer />
    </main>
  );
}
