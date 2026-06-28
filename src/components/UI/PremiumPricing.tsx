"use client";

import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { CheckCheck } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { ReactNode, useRef, useState } from "react";

// --- INLINE REPLACEMENTS FOR MISSING COMPONENTS ---

// 1. Vertical Cut Reveal (Text Masking Animation)
const VerticalCutReveal = ({
  children,
  staggerDuration = 0.15,
  delay = 0,
  containerClassName,
}: {
  children: string;
  staggerDuration?: number;
  delay?: number;
  containerClassName?: string;
  splitBy?: string;
  staggerFrom?: string;
  reverse?: boolean;
  transition?: any;
}) => {
  const words = children.split(" ");
  return (
    <div className={cn("flex flex-wrap gap-x-3 gap-y-1", containerClassName)}>
      {words.map((word, i) => (
        <div key={i} className="overflow-hidden pb-2">
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: delay + i * staggerDuration,
            }}>
            {word}
          </motion.div>
        </div>
      ))}
    </div>
  );
};

// 2. Timeline Content Wrapper (Staggered Fade/Up)
const TimelineContent = ({
  children,
  animationNum,
  variants,
  className,
  as: Component = "div",
}: {
  children: ReactNode;
  animationNum: number;
  variants: any;
  className?: string;
  timelineRef?: any;
  customVariants?: any;
  as?: "div" | "p" | "span";
}) => {
  const MotionComponent = motion[Component] as any;
  return (
    <MotionComponent
      custom={animationNum}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={className}>
      {children}
    </MotionComponent>
  );
};

// --- MAIN COMPONENT ---

const plans = [
  {
    name: "Single Outlet",
    description:
      "Perfect for independent restaurants demanding operational stability.",
    price: 49,
    yearlyPrice: 470,
    buttonText: "Start Free Trial",
    includes: [
      "Up to 3 Waiter Logins",
      "Basic KDS Integration",
      "More features coming soon...",
    ],
  },
  {
    name: "Restaurant Group",
    description:
      "Advanced architecture for high-volume venues requiring real-time sync.",
    price: 129,
    yearlyPrice: 1199,
    buttonText: "Deploy System",
    popular: true,
    includes: [
      "Live Manager Dashboard",
      "Interactive Floorplan Editor",
      "More features coming soon...",
    ],
  },
  {
    name: "Enterprise Chain",
    description:
      "Bespoke multi-tenant deployment for hospitality chains scaling globally.",
    price: 299,
    yearlyPrice: 2899,
    buttonText: "Contact Sales",
    includes: [
      "Multi-Property Analytics",
      "Custom Hardware Provisioning",
      "More features coming soon...",
    ],
  },
];

const PricingSwitch = ({
  onSwitch,
  className,
}: {
  onSwitch: (value: string) => void;
  className?: string;
}) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className={cn("flex justify-center", className)}>
      <div className="relative z-10 mx-auto flex w-fit rounded-xl bg-neutral-50 border border-gray-200 p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit cursor-pointer h-12 rounded-xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
            selected === "0" ? "text-white" : "text-black ",
          )}>
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-12 w-full rounded-xl border-4 shadow-sm shadow-yellow-600 border-yellow-600 bg-gradient-to-t from-yellow-400 via-yellow-500 to-yellow-600"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative">Monthly Billing</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit cursor-pointer h-12 flex-shrink-0 rounded-xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
            selected === "1" ? "text-white" : "text-black",
          )}>
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-12 w-full rounded-xl border-4 shadow-sm shadow-yellow-600 border-yellow-600 bg-gradient-to-t from-yellow-400 via-yellow-500 to-yellow-600"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            Yearly Billing
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-black">
              Save 20%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection5() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.15, // Adjusted for smoother sequential reveal
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value) === 1);

  return (
    <div
      id="premium"
      className="px-4 py-20 max-w-6xl mx-auto relative flex flex-col justify-center"
      ref={pricingRef}>
      <article className="text-left flex items-center mb-6 space-y-4">
        <div className=" max-w-2xl">
          <h2 className="md:text-5xl text-4xl capitalize font-garamond font-medium text-[#C0A985] mb-4">
            <VerticalCutReveal containerClassName="justify-start">
              Select a tier that scales with your operations
            </VerticalCutReveal>
          </h2>

          <TimelineContent
            as="p"
            animationNum={0}
            variants={revealVariants}
            className="md:text-base text-sm text-white/80 w-[80%]">
            Engineered for excellence. Deploy DineOS across a single boutique or
            a global franchise network.
          </TimelineContent>
        </div>
        <TimelineContent as="div" animationNum={1} variants={revealVariants}>
          <PricingSwitch onSwitch={togglePricingPeriod} className="w-fit" />
        </TimelineContent>
      </article>

      <div className="grid md:grid-cols-3 gap-4 py-6">
        {plans.map((plan, index) => (
          <TimelineContent
            key={plan.name}
            as="div"
            animationNum={2 + index}
            variants={revealVariants}>
            {/* Inline Card Replacement */}
            <div
              className={`relative flex flex-col h-full rounded-[2rem] border transition-colors duration-300 ${
                plan.popular
                  ? "ring-2 ring-[#C5A880] bg-[#111111] border-0 shadow-[0_0_40px_-10px_rgba(197,168,128,0.15)]"
                  : "bg-[#0A0A0A] border-[#222222] hover:border-[#333333]"
              }`}>
              {/* Card Header */}
              <div className="flex flex-col p-6 text-left border-b border-[#222222]/50">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl md:text-3xl font-garamond font-bold text-[#FAF9F6]">
                    {plan.name}
                  </h3>
                  {plan.popular && (
                    <span className="absolute -top-5 right-5 bg-[#C5A880] text-[#0A0A0A] px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase font-sans mt-1">
                      Standard
                    </span>
                  )}
                </div>
                <p className="text-xs font-sans text-[#888888] mb-6 leading-relaxed pr-2">
                  {plan.description}
                </p>
                <div className="flex items-baseline mt-auto">
                  <span className="text-4xl md:text-5xl font-garamond font-bold text-[#C5A880] flex items-center">
                    $
                    <NumberFlow
                      format={{ currency: "USD" }}
                      value={isYearly ? plan.yearlyPrice : plan.price}
                      className="text-3xl md:text-4xl font-libre font-bold ml-1"
                    />
                  </span>
                  <span className="text-[#5A5A5A] font-sans font-semibold ml-2 uppercase tracking-widest text-[10px]">
                    /{isYearly ? "year" : "month"}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex flex-col flex-grow">
                <Link
                  href="/subscription"
                  className={`w-full mb-6 py-3 px-4 text-xs font-sans uppercase tracking-[0.2em] font-bold rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${
                    plan.popular
                      ? "bg-[#C5A880] text-[#0A0A0A] hover:bg-[#FAF9F6]"
                      : "bg-transparent border border-[#333333] text-[#FAF9F6] hover:border-[#C5A880] hover:text-[#C5A880]"
                  }`}>
                  {plan.buttonText}
                </Link>

                <div className="space-y-4 pt-2 flex-grow">
                  <div className="flex items-center gap-4">
                    <div className="h-[1px] flex-grow bg-[#222222]" />
                    <h2 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#5A5A5A]">
                      Included
                    </h2>
                    <div className="h-[1px] flex-grow bg-[#222222]" />
                  </div>

                  <ul className="space-y-3 font-sans">
                    {plan.includes.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <span className="h-4 w-4 bg-[#C5A880]/10 border border-[#C5A880]/30 rounded-full flex items-center justify-center shrink-0 mr-3 mt-0.5">
                          <CheckCheck className="h-2.5 w-2.5 text-[#C5A880]" />
                        </span>
                        <span className="text-xs text-[#888888] leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </TimelineContent>
        ))}
      </div>
    </div>
  );
}
