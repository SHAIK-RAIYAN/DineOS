"use client";

import { useLenis } from "lenis/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ChefIcon from "../../../public/Icons/chef";
import { RevealText } from "./RevealText";

export function SplashHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const lenis = useLenis();
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Signup/Login", href: "/login" },
    { label: "Buy Premium", href: "/#premium" },
    { label: "Contact", href: "/#contact" },
  ];

  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    // Intercept only if we are on the root page and it's a root/hash link
    if (pathname === "/") {
      if (href === "/") {
        e.preventDefault();
        lenis?.scrollTo(0, { offset: 0 });
      } else if (href.startsWith("/#")) {
        e.preventDefault();
        const targetId = href.replace("/", "");
        lenis?.scrollTo(targetId, { offset: 0 });
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 flex flex-col items-center">
      <motion.div
        initial={{ width: "400px" }}
        animate={{ width: isOpen ? "600px" : "400px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white text-black flex items-center justify-between rounded-3xl px-8 py-4 shadow-2xl overflow-hidden">
        <a
          href="/"
          onClick={() => setIsOpen(false)}
          className="flex items-start justify-center gap-1 shrink-0 cursor-pointer">
          <ChefIcon className="size-8" />
          <h1 className="text-2xl md:text-3xl font-libre font-bold tracking-tight">
            DINEOS
          </h1>
        </a>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="shrink-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="font-bold text-sm uppercase tracking-widest cursor-pointer hover:opacity-70 transition-opacity w-16 text-left">
            <RevealText text={isOpen ? "Close" : "Menu"} />
          </button>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 w-full bg-white rounded-3xl p-8 shadow-2xl origin-top">
            <nav className="flex flex-col gap-6 p-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.3,
                    ease: "easeOut",
                  }}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleNavigation(e, link.href)}
                    className="block text-4xl border-b md:text-5xl font-garamond text-black hover:text-[#0F1B06] transition-colors cursor-pointer">
                    <RevealText text={link.label} />
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
