"use client";

import { Cog, GraduationCap, Globe, Handshake, Sprout, TrendingUp, Users, Volume2 } from "lucide-react";

const features = [
  { icon: Users, label: "Stronger Community" },
  { icon: TrendingUp, label: "Better Opportunities" },
  { icon: Handshake, label: "Grow Together" },
  { icon: GraduationCap, label: "Training & Support" },
  { icon: Globe, label: "Market Linkages" },
  { icon: Cog, label: "Resources & Schemes" },
  { icon: Volume2, label: "Stronger Voice" },
  { icon: Sprout, label: "Sustainable Growth" },
];

export default function FeatureStrip() {
  return (
    <div className="relative z-20 -mt-8 md:-mt-10">
      <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-[0_20px_50px_-28px_rgba(11,74,46,0.5)] backdrop-blur-xl backdrop-saturate-150">
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
          aria-hidden="true"
        />
        <div className="flex items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:overflow-visible">
          {features.map((item, i) => (
            <div
              key={item.label}
              className={`group flex shrink-0 lg:shrink lg:flex-1 items-center gap-2.5 px-4 py-4 transition-colors hover:bg-white/60 lg:px-3 xl:px-4 ${
                i > 0 ? "border-l border-[#0b4a2e]/10" : ""
              }`}
            >
              <span className="flex w-9 h-9 shrink-0 items-center justify-center rounded-full bg-[#bbf7d0]/80 ring-1 ring-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-transform duration-300 group-hover:scale-105">
                <item.icon className="w-4 h-4 text-[#0b4a2e]" />
              </span>
              <span className="text-[11px] xl:text-[11.5px] font-semibold text-[#0b4a2e] leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
