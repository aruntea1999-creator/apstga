"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ segments }: { segments: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted mb-3">
      <Link href="/admin" className="hover:text-[#0B4A2E] transition-colors"><Home className="w-3.5 h-3.5" /></Link>
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3" />
          {seg.href && i < segments.length - 1 ? (
            <Link href={seg.href} className="hover:text-[#0B4A2E] transition-colors">{seg.label}</Link>
          ) : (
            <span className="text-foreground font-medium">{seg.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
