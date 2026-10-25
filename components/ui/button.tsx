"use client";

import { VariantProps, cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import { twMerge } from "tailwind-merge";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-dark active:bg-primary-dark shadow-sm hover:shadow-md",
        secondary: "bg-primary-light text-white hover:bg-primary active:bg-primary-dark",
        outline: "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white",
        ghost: "bg-transparent text-primary hover:bg-primary/5",
        accent: "bg-accent text-primary-dark hover:bg-accent-dark hover:text-white shadow-sm hover:shadow-md",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
      rounded: {
        default: "rounded-[12px]",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  },
);

export interface ButtonProps extends ComponentPropsWithoutRef<typeof motion.button>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<ElementRef<typeof motion.button>, ButtonProps>(
  ({ className, variant, size, rounded, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={twMerge(buttonVariants({ variant, size, rounded }), className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
