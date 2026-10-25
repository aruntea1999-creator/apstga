"use client";

import { forwardRef, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  fluid?: boolean;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, fluid = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
          fluid && "max-w-none px-0",
          className,
        )}
        {...props}
      />
    );
  },
);

Container.displayName = "Container";