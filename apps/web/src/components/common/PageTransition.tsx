"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { pageVariants } from "@/lib/motion";
import { cn } from "@/utils/cn";

export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn("min-w-0", className)}
    >
      {children}
    </motion.div>
  );
}
