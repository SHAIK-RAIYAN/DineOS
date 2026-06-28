"use client";

import { Footer } from "@/components/UI/Footer";
import { SplashHeader } from "@/components/UI/SpashHeader";
import { clsx, type ClassValue } from "clsx";
import { useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NOT_FOUND_DEFAULTS = {
  code: "404",
  title: "Table Not Found",
  description:
    "The page you are looking for does not exist, has been moved, or you don't have access.",
  homeHref: "/",
  homeLabel: "Return to Home",
};

export interface NotFoundProps {
  className?: string;
  code?: string;
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
}

interface NotFoundStageProps {
  className?: string;
  children: ReactNode;
}

function NotFoundStage({ className, children }: NotFoundStageProps) {
  return (
    <section
      className={cn(
        "flex min-h-screen w-full flex-col items-center justify-center gap-8 px-6 py-20 text-center bg-[#0A0A0A] relative z-10",
        className,
      )}>
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C5A880]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      {children}
    </section>
  );
}

function NotFoundActions({
  homeHref = NOT_FOUND_DEFAULTS.homeHref,
  homeLabel = NOT_FOUND_DEFAULTS.homeLabel,
}: NotFoundProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
      <Link
        href={homeHref}
        className="inline-flex h-12 items-center justify-center rounded-full bg-[#C5A880] px-8 text-sm font-bold tracking-widest uppercase text-[#0A0A0A] transition-transform hover:scale-[1.05] active:scale-[0.97]">
        {homeLabel}
      </Link>
    </div>
  );
}

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@$?/\\";
const SCRAMBLE_MS = 700;
const TICK_MS = 45;

function Scramble({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (reduce) {
      setDisplay(text);
      return;
    }

    const chars = text.split("");
    const start = performance.now();
    let raf = 0;
    let last = 0;

    const loop = (now: number) => {
      if (now - last >= TICK_MS) {
        last = now;

        const progress = Math.min((now - start) / SCRAMBLE_MS, 1);
        const settled = Math.floor(progress * chars.length);

        setDisplay(
          chars
            .map((ch, i) =>
              i < settled || ch === " "
                ? ch
                : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            )
            .join(""),
        );
      }

      if (now - start < SCRAMBLE_MS) {
        raf = requestAnimationFrame(loop);
      } else {
        setDisplay(text);
      }
    };

    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }, [text, reduce]);

  return <span className="tabular-nums">{display}</span>;
}

export function NotFoundGlitch({
  className,
  code = NOT_FOUND_DEFAULTS.code,
  title = NOT_FOUND_DEFAULTS.title,
  description = NOT_FOUND_DEFAULTS.description,
  homeHref,
  homeLabel,
}: NotFoundProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] overflow-hidden selection:bg-[#C5A880] selection:text-[#0A0A0A]">
      <SplashHeader />

      <NotFoundStage className={className}>
        <div className="group relative select-none  font-bold leading-none tracking-tighter text-[#FAF9F6] [font-size:clamp(5rem,18vw,12rem)] mb-4">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 text-[#C5A880] opacity-0 mix-blend-screen transition-[transform,opacity] duration-150 ease-out group-hover:translate-x-[4px] group-hover:opacity-70 motion-reduce:hidden">
            <Scramble text={code} />
          </span>

          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 text-[#333333] opacity-0 mix-blend-screen transition-[transform,opacity] duration-150 ease-out group-hover:-translate-x-[4px] group-hover:opacity-70 motion-reduce:hidden">
            <Scramble text={code} />
          </span>

          <h1 className="relative">
            <Scramble text={code} />
          </h1>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-3xl md:text-4xl font-garamond font-bold text-[#C5A880]">
            {title}
          </p>
          <p className="max-w-md text-lg text-[#888888] font-sans leading-relaxed">
            {description}
          </p>
        </div>

        <NotFoundActions homeHref={homeHref} homeLabel={homeLabel} />
      </NotFoundStage>

      <Footer />
    </div>
  );
}
