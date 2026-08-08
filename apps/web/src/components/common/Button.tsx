"use client";

import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-sky-500 text-white hover:bg-sky-600 shadow-soft",
        secondary:
          "bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-sm",
        ghost: "hover:bg-sky-50 text-slate-700",
        danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-coral",
        success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-mint",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2.5 text-sm",
        lg: "px-6 py-3 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { y: -2, scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled}
      {...(props as object)}
    >
      <span className="flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
}
