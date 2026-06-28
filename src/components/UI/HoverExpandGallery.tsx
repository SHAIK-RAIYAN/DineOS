"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useState } from "react";
import Image from "next/image";

export const HoverExpandGallery = ({ className }: { className?: string }) => {
  const [activeImage, setActiveImage] = useState<number | null>(0);

  const modules = [
    {
      src: "/images/dining5.webp",
      alt: "Royal Dining Atmosphere",
      your: "Ambiance",
      our: "Stability",
    },
    {
      src: "/images/chef4fire.webp",
      alt: "Kitchen Execution",
      your: "Culinary Art",
      our: "Precision",
    },
    {
      src: "/images/food5.webp",
      alt: "Plated Dish",
      your: "Gastronomy",
      our: "Velocity",
    },
    {
      src: "/images/drink3.webp",
      alt: "Crafted Beverages",
      your: "Mixology",
      our: "Accuracy",
    },
    {
      src: "/images/chef3fire.webp",
      alt: "Culinary Flame",
      your: "Mastery",
      our: "Analytics",
    },
    {
      src: "/images/food6.webp",
      alt: "Exquisite Plating",
      your: "Artistry",
      our: "Workflow",
    },
    {
      src: "/images/dining3.webp",
      alt: "Elegant Table Setting",
      your: "Elegance",
      our: "Reliability",
    },
    {
      src: "/images/drink5.webp",
      alt: "Signature Cocktail",
      your: "Signature",
      our: "Scale",
    },
    {
      src: "/images/dessert1.webp",
      alt: "Sweet Indulgence",
      your: "Indulgence",
      our: "Control",
    },
  ];

  return (
    <div
      className={cn(
        "relative w-full max-w-7xl mx-auto px-2 md:px-5",
        className,
      )}>
      <div className="flex w-full items-center justify-center gap-2 h-[30rem]">
        {modules.map((module, index) => {
          const isActive = activeImage === index;

          return (
            <motion.div
              key={index}
              className="relative cursor-pointer overflow-hidden rounded-3xl h-full origin-center will-change-[width]"
              initial={false}
              animate={{
                width: isActive ? "32rem" : "5rem",
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 40,
                mass: 0.8,
              }}
              onHoverStart={() => setActiveImage(index)}
              onClick={() => setActiveImage(index)}>
              <Image
                src={module.src}
                alt={module.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0}
                className="object-cover"
              />

              <motion.div
                initial={false}
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/95 via-[#0A0A0A]/40 to-transparent z-10 pointer-events-none will-change-opacity"
              />

              <motion.div
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                  y: isActive ? 0 : 15,
                }}
                transition={{ duration: 0.3, delay: isActive ? 0.1 : 0 }}
                className="absolute bottom-0 left-0 flex w-full flex-col p-6 md:p-8 z-20 pointer-events-none will-change-transform">
                <p className="text-left text-sm md:text-base font-sans font-semibold tracking-[0.2em] text-[#888888] uppercase mb-1">
                  Your {module.your}
                </p>
                <p className="text-left text-2xl md:text-4xl font-garamond font-bold tracking-widest text-[#C5A880] uppercase">
                  Our {module.our}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
