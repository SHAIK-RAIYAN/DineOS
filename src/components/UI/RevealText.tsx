import { motion } from "motion/react";
interface RevealTextProps {
  text: string;
}

export function RevealText({ text }: RevealTextProps) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      className="relative overflow-hidden cursor-pointer flex flex-col justify-center">
      <motion.span
        variants={{
          rest: { y: 0 },
          hover: { y: "-120%" },
        }}
        transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        className="inline-block ">
        {text}
      </motion.span>
      <motion.span
        variants={{
          rest: { y: "100%" },
          hover: { y: 0 },
        }}
        transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        className="inline-block absolute left-0 ">
        {text}
      </motion.span>
    </motion.div>
  );
}
