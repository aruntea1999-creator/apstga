"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Inbox, Megaphone, UserPlus } from "lucide-react";
import { useSettings } from "@/lib/use-settings";

const HERO_IMAGE = "/hero/Golden Sunrise Over Terraced Tea Fields.png";

type Notice = { title: string; date: string; tag: string };

export default function HeroSection() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const { settings } = useSettings();
  const heroTitle = settings.hero.title;
  const highlightOffset = heroTitle.lastIndexOf("Arunachal.");
  const headline = highlightOffset === -1 ? heroTitle : heroTitle.slice(0, highlightOffset);
  const highlight = highlightOffset === -1 ? "" : heroTitle.slice(highlightOffset);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        if (json.error) return;
        setNotices(json.notices || []);
      })
      .catch(() => {});
  }, []);

  const visibleNotices = notices.slice(0, 4);

  return (
    <section className="relative w-full bg-[#0b4a2e]">
      <div className="gloss gloss-soft relative flex w-full min-h-[560px] sm:min-h-[520px] lg:min-h-[370px]">
        <Image
          src={HERO_IMAGE}
          alt="Tea gardens of Arunachal Pradesh at sunrise"
          fill
          preload
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b4a2e]/95 via-[#0b4a2e]/80 to-[#0b4a2e]/40 lg:to-transparent" />

        <div className="relative z-10 flex w-full max-w-[1600px] mx-auto px-8 lg:px-12 xl:px-16">
          <div className="flex w-full flex-col justify-center gap-8 py-10 lg:flex-row lg:items-center lg:gap-10 lg:py-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full lg:w-[56%] xl:w-[58%]"
            >
              <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.18em] text-[#86efac]">
                Arunachal Pradesh Small Tea Growers Association
              </p>

              <h1 className="mt-3 text-[26px] sm:text-[32px] lg:text-[40px] font-extrabold text-white leading-[1.12] tracking-[-0.02em] max-w-2xl">
                {headline}
                {highlight && <span className="text-[#86efac]">{highlight}</span>}
              </h1>

              <p className="mt-3 text-sm md:text-[15px] text-white/85 leading-relaxed max-w-xl">
                {settings.hero.subtitle}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#15803d] hover:bg-[#0b4a2e] text-white text-sm font-semibold shadow-lg shadow-[#0b4a2e]/30 ring-1 ring-white/25 transition-all hover:shadow-xl hover:shadow-[#0b4a2e]/40"
                >
                  <UserPlus className="w-4 h-4" />
                  Register as Grower
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link
                  href="/about"
                  className="group inline-flex items-center gap-2 h-11 pl-6 pr-2 rounded-full border border-white/60 bg-white/10 backdrop-blur-md hover:border-white hover:bg-white/20 text-white text-sm font-semibold transition-all"
                >
                  Explore APSTGA
                  <span className="flex w-8 h-8 items-center justify-center rounded-full bg-white text-[#0b4a2e] transition-transform group-hover:rotate-45">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="w-full lg:ml-auto lg:max-w-[360px] xl:max-w-[380px]"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/50 bg-white/85 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.5)] backdrop-blur-xl backdrop-saturate-150">
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
                  aria-hidden="true"
                />
                <div className="flex items-center justify-between gap-3 bg-[#0b4a2e]/95 px-4 py-3 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-[#86efac]" />
                    <h2 className="text-sm font-bold text-white">Notice Board</h2>
                  </div>
                  <Link href="/news" className="flex items-center gap-1 text-[11px] font-medium text-[#86efac] hover:text-white transition-colors">
                    View All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="px-4 py-2">
                  {visibleNotices.length > 0 ? (
                    <ul className="divide-y divide-border">
                      {visibleNotices.map((item, i) => (
                        <li key={`${item.title}-${i}`} className="flex items-start gap-2.5 py-2.5">
                          <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-[#15803d] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-foreground leading-snug line-clamp-2">{item.title}</p>
                            <p className="mt-0.5 text-[10px] text-muted">{item.date}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                      <Inbox className="w-5 h-5 text-[#86efac]" />
                      <p className="text-[11px] text-muted">No notices or events yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-4 right-6 lg:right-12 z-10 hidden md:flex items-center gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-4 rounded-full bg-[#86efac]" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
        </div>
      </div>
    </section>
  );
}
