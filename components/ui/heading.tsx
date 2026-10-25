"use client";

import { forwardRef, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as, level, children, ...props }, ref) => {
    const Component = as || (`h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6");

    const baseStyles = "font-serif font-bold text-foreground tracking-tight";

    const sizes = {
      1: "text-4xl md:text-5xl lg:text-6xl",
      2: "text-3xl md:text-4xl lg:text-5xl",
      3: "text-2xl md:text-3xl lg:text-4xl",
      4: "text-xl md:text-2xl lg:text-3xl",
      5: "text-lg md:text-xl lg:text-2xl",
      6: "text-base md:text-lg lg:text-xl",
    };

    const styles = level ? sizes[level] : "";

    return (
      <Component ref={ref} className={twMerge(baseStyles, styles, className)} {...props}>
        {children}
      </Component>
    );
  },
);

Heading.displayName = "Heading";