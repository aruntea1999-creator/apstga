"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          "rounded-[20px] border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow",
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";
