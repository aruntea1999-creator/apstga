"use client";

import { type HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: "section" | "article" | "div";
}

export function Section({ className, as: Component = "section", ...props }: SectionProps) {
  return (
    <Component className={twMerge("py-16 md:py-24", className)} {...props} />
  );
}
