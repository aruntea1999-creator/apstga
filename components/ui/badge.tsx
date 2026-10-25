"use client";

import { VariantProps, cva } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border border-primary/20",
        secondary: "bg-gray-100 text-gray-800 border border-gray-200",
        outline: "bg-transparent text-primary border border-primary/40",
        accent: "bg-accent/10 text-primary-dark border border-accent/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span ref={ref} className={twMerge(badgeVariants({ variant }), className)} {...props} />
    );
  },
);

Badge.displayName = "Badge";
