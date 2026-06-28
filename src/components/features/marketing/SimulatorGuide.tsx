"use client";

import { BarChart, ChefHat, CreditCard, Monitor, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue, useScroll, useTransform, type Variants } from "motion/react";
import Link from "next/link";
import { useRef } from "react";

// --- SPOTLIGHT CARD ---
function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative rounded-3xl border border-[#333333] bg-[#111111] overflow-hidden hover:border-[#5A5A5A] transition-colors ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(197, 168, 128, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

// --- ANIMATION VARIANTS ---
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, x: -20, filter: "blur(4px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

export function SimulatorGuide() {
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="py-32 bg-[#0A0A0A] rounded-t-[3rem] -mt-10 text-[#FAF9F6] relative z-20 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#C5A880]/5 rounded-full blur-[150px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-garamond font-bold mb-6 tracking-tight">
            Experience It <span className="text-[#C5A880] italic">Live</span>
          </h2>
          <p className="text-xl text-[#888888] font-sans max-w-3xl mx-auto leading-relaxed">
            Reading about milliseconds is one thing; witnessing it is another. Follow this interactive guide to simulate a full restaurant lifecycle and experience the true power of WebSockets.
          </p>
        </motion.div>

        {/* Phase 1: Setup */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-32">
          
          <motion.div variants={item} className="flex items-center gap-4 mb-10 border-b border-[#333333] pb-6">
            <div className="w-10 h-10 rounded-full bg-[#C5A880]/10 flex items-center justify-center border border-[#C5A880]/30">
              <span className="text-[#C5A880] font-bold font-garamond text-xl">I</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-garamond font-bold text-[#FAF9F6]">
              Terminal Assembly
            </h3>
          </motion.div>

          <motion.p variants={item} className="text-[#888888] mb-10 font-sans text-lg md:text-xl leading-relaxed max-w-4xl">
            To see the ecosystem breathe, you need eyes on every station. Open the following four modules in separate browser tabs, or distribute them across multiple monitors.
          </motion.p>
          
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Monitor, label: "Waiter", href: "/waiter" },
              { icon: ChefHat, label: "KDS", href: "/kds" },
              { icon: CreditCard, label: "Cashier", href: "/cashier" },
              { icon: BarChart, label: "Manager", href: "/manager" },
            ].map((terminal) => (
              <Link key={terminal.label} href={terminal.href} target="_blank" className="block outline-none group">
                <SpotlightCard className="h-full flex flex-col items-center justify-center p-8 text-center border-[#222222]">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-[#C5A880]/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <terminal.icon className="w-10 h-10 text-[#FAF9F6] relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:text-[#C5A880]" />
                  </div>
                  <span className="font-bold text-sm tracking-[0.2em] uppercase text-[#888888] group-hover:text-[#FAF9F6] transition-colors">
                    {terminal.label}
                  </span>
                </SpotlightCard>
              </Link>
            ))}
          </motion.div>
        </motion.div>

        {/* Phase 2: Simulation with Timeline */}
        <div className="relative" ref={timelineRef}>
          {/* Vertical Progress Line */}
          <div className="absolute left-[27px] top-0 bottom-0 w-px bg-[#222222] hidden md:block" />
          <motion.div 
            style={{ height: lineHeight }}
            className="absolute left-[27px] top-0 w-px bg-gradient-to-b from-[#C5A880] to-[#C5A880]/20 hidden md:block shadow-[0_0_10px_#C5A880]"
          />

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-24">
            
            <motion.div variants={item} className="flex items-center gap-4 border-b border-[#333333] pb-6 mb-16 ml-0 md:ml-20">
              <div className="w-10 h-10 rounded-full bg-[#C5A880]/10 flex items-center justify-center border border-[#C5A880]/30 md:hidden">
                <span className="text-[#C5A880] font-bold font-garamond text-xl">II</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-garamond font-bold text-[#FAF9F6]">
                The Execution
              </h3>
            </motion.div>

            <ul className="space-y-16 relative">
              {/* Step 1 */}
              <motion.li variants={item} className="flex flex-col md:flex-row items-start gap-8 md:gap-12 group">
                <div className="hidden md:flex w-14 h-14 rounded-full bg-[#0A0A0A] border-2 border-[#333333] items-center justify-center shrink-0 font-garamond text-2xl font-bold text-[#C5A880] relative z-10 transition-colors duration-500 group-hover:border-[#C5A880] group-hover:shadow-[0_0_20px_rgba(197,168,128,0.3)]">
                  1
                </div>
                <SpotlightCard className="w-full">
                  <div className="p-8 md:p-10">
                    <strong className="text-[#FAF9F6] text-3xl font-garamond block mb-6 flex items-center gap-3">
                      Seat the Guests <ArrowRight className="w-6 h-6 text-[#C5A880] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    </strong>
                    <p className="leading-relaxed text-[#888888] text-xl font-sans">
                      Navigate to the{" "}
                      <Link href="/waiter" target="_blank" className="relative inline-block text-[#C5A880] font-semibold group/link">
                        Waiter Terminal
                        <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A880] scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left" />
                      </Link>
                      . The interactive floorplan shows the live status of all tables. Click on any green (Free) table to seat your virtual guests. The table will immediately snap to yellow (Occupied). 
                    </p>
                  </div>
                </SpotlightCard>
              </motion.li>

              {/* Step 2 */}
              <motion.li variants={item} className="flex flex-col md:flex-row items-start gap-8 md:gap-12 group">
                <div className="hidden md:flex w-14 h-14 rounded-full bg-[#0A0A0A] border-2 border-[#333333] items-center justify-center shrink-0 font-garamond text-2xl font-bold text-[#C5A880] relative z-10 transition-colors duration-500 group-hover:border-[#C5A880] group-hover:shadow-[0_0_20px_rgba(197,168,128,0.3)]">
                  2
                </div>
                <SpotlightCard className="w-full">
                  <div className="p-8 md:p-10">
                    <strong className="text-[#FAF9F6] text-3xl font-garamond block mb-6 flex items-center gap-3">
                      Fire the Order <ArrowRight className="w-6 h-6 text-[#C5A880] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    </strong>
                    <p className="leading-relaxed text-[#888888] text-xl font-sans">
                      With the table selected, expand the Menu Catalog on the right. Build a feast by adding appetizers and mains to the cart. Don't forget to add a custom modifier like "Extra Spicy". When ready, hit the bold <em className="text-[#FAF9F6] not-italic font-bold px-2 py-1 bg-[#222222] rounded-md">Fire Order</em> button.
                    </p>
                  </div>
                </SpotlightCard>
              </motion.li>

              {/* Step 3 */}
              <motion.li variants={item} className="flex flex-col md:flex-row items-start gap-8 md:gap-12 group">
                <div className="hidden md:flex w-14 h-14 rounded-full bg-[#0A0A0A] border-2 border-[#333333] items-center justify-center shrink-0 font-garamond text-2xl font-bold text-[#C5A880] relative z-10 transition-colors duration-500 group-hover:border-[#C5A880] group-hover:shadow-[0_0_20px_rgba(197,168,128,0.3)]">
                  3
                </div>
                <SpotlightCard className="w-full">
                  <div className="p-8 md:p-10">
                    <strong className="text-[#FAF9F6] text-3xl font-garamond block mb-6 flex items-center gap-3">
                      Cook & Bump <ArrowRight className="w-6 h-6 text-[#C5A880] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    </strong>
                    <p className="leading-relaxed text-[#888888] text-xl font-sans mb-8">
                      Switch instantly to the{" "}
                      <Link href="/kds" target="_blank" className="relative inline-block text-[#C5A880] font-semibold group/link">
                        Kitchen Display System (KDS)
                        <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A880] scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left" />
                      </Link>
                      . The items you fired are already flashing on the board with a live running timer. 
                    </p>
                    <div className="bg-[#1A1A1A]/80 border border-[#333333] rounded-2xl p-6 flex items-start gap-4 shadow-inner">
                      <CheckCircle2 className="w-6 h-6 text-[#C5A880] shrink-0 mt-1" />
                      <p className="text-[#DCDCDA] italic text-lg leading-relaxed">
                        Click <strong className="not-italic text-[#FAF9F6]">Done</strong> on the tickets to bump them. If you peek back at the Waiter Tab, you'll see those exact items have dynamically shifted to "Completed", signaling the floor staff to run the plates.
                      </p>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.li>

              {/* Step 4 */}
              <motion.li variants={item} className="flex flex-col md:flex-row items-start gap-8 md:gap-12 group">
                <div className="hidden md:flex w-14 h-14 rounded-full bg-[#0A0A0A] border-2 border-[#333333] items-center justify-center shrink-0 font-garamond text-2xl font-bold text-[#C5A880] relative z-10 transition-colors duration-500 group-hover:border-[#C5A880] group-hover:shadow-[0_0_20px_rgba(197,168,128,0.3)]">
                  4
                </div>
                <SpotlightCard className="w-full">
                  <div className="p-8 md:p-10">
                    <strong className="text-[#FAF9F6] text-3xl font-garamond block mb-6 flex items-center gap-3">
                      Settle the Bill <ArrowRight className="w-6 h-6 text-[#C5A880] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    </strong>
                    <p className="leading-relaxed text-[#888888] text-xl font-sans">
                      The meal concludes. Open the{" "}
                      <Link href="/cashier" target="_blank" className="relative inline-block text-[#C5A880] font-semibold group/link">
                        Cashier Terminal
                        <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A880] scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left" />
                      </Link>
                      . The table is glowing red, awaiting settlement. Open it to access the advanced Bill Splitter. Divide the check evenly or enter custom amounts. Click <em className="text-[#FAF9F6] not-italic font-bold px-2 py-1 bg-[#222222] rounded-md mx-1">Collect Payment</em> to close the order, instantly freeing the table globally.
                    </p>
                  </div>
                </SpotlightCard>
              </motion.li>

              {/* Step 5 */}
              <motion.li variants={item} className="flex flex-col md:flex-row items-start gap-8 md:gap-12 group">
                <div className="hidden md:flex w-14 h-14 rounded-full bg-[#1A1A1A] border-2 border-[#C5A880] items-center justify-center shrink-0 font-garamond text-2xl font-bold text-[#C5A880] relative z-10 transition-all duration-500 group-hover:bg-[#C5A880] group-hover:text-[#0A0A0A] shadow-[0_0_30px_rgba(197,168,128,0.4)]">
                  5
                </div>
                <div className="w-full relative rounded-3xl border border-[#C5A880]/40 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] overflow-hidden shadow-[0_0_40px_rgba(197,168,128,0.1)] transition-all duration-500 hover:border-[#C5A880] hover:shadow-[0_0_50px_rgba(197,168,128,0.2)]">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                  <div className="relative z-10 p-8 md:p-10">
                    <strong className="text-[#C5A880] text-3xl font-garamond block mb-6">
                      The Omnipresent Manager
                    </strong>
                    <p className="leading-relaxed text-[#FAF9F6] text-xl font-sans">
                      Finally, enter the{" "}
                      <Link href="/manager" target="_blank" className="relative inline-block text-[#C5A880] font-bold group/link">
                        Manager Dashboard
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C5A880] scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left" />
                      </Link>
                      . Without ever hitting refresh, you will see the revenue charts, live order counts, and cross-outlet metrics fully updated, reflecting the exact milliseconds of the transaction cycle you just completed.
                    </p>
                  </div>
                </div>
              </motion.li>

            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
