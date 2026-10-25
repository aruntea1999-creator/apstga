"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BarChart3, Leaf, Sprout, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DistrictMap from "@/components/sections/district-map";

type StatsData = {
  totalGrowers: number;
  teaArea: number;
  annualProduction: number;
  organicGrowers: number;
  conventionalGrowers: number;
  growersByDistrict: { name: string; value: number }[];
  areaByDistrict: { name: string; area: number }[];
  monthlyProduction: { month: string; prod: number }[];
};

const EMPTY_STATS: StatsData = {
  totalGrowers: 0,
  teaArea: 0,
  annualProduction: 0,
  organicGrowers: 0,
  conventionalGrowers: 0,
  growersByDistrict: [],
  areaByDistrict: [],
  monthlyProduction: [],
};

const DISTRICT_COLORS = ["#0b4a2e", "#15803d", "#4d7c0f", "#1f7a6c", "#86efac", "#bbf7d0"];
const ORGANIC_COLOR = "#15803d";
const CONVENTIONAL_COLOR = "#d98b34";

const TICK = { fontSize: 9, fill: "#6b7280" } as const;
const TOOLTIP_STYLE = { fontSize: 11, borderRadius: 10, border: "1px solid #e8f0ea" } as const;

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<StatsData>(EMPTY_STATS);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => { if (!json.error) setStats(json); })
      .catch(() => {});
  }, []);

  const organicData = [
    { name: "Organic", value: stats.organicGrowers, color: ORGANIC_COLOR },
    { name: "Conventional", value: stats.conventionalGrowers, color: CONVENTIONAL_COLOR },
  ];
  const organicTotal = organicData.reduce((s, d) => s + d.value, 0);
  const organicShare = organicTotal > 0 ? Math.round((stats.organicGrowers / organicTotal) * 100) : 0;

  const hasGrowers = stats.totalGrowers > 0 && stats.growersByDistrict.length > 0;
  const hasArea = stats.areaByDistrict.some((d) => d.area > 0);
  const hasProduction = stats.monthlyProduction.some((m) => m.prod > 0);

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex w-11 h-11 shrink-0 items-center justify-center rounded-2xl bg-[#bbf7d0]/80 ring-1 ring-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm">
            <BarChart3 className="w-5 h-5 text-[#0b4a2e]" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-[#0b4a2e] leading-tight">Association Overview</h2>
            <p className="text-xs text-muted">Key insights and statistics at a glance</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#15803d]">
          <Leaf className="w-4 h-4" />
          <span>Healthy Growers</span>
          <span className="text-[#bbf7d0]">|</span>
          <span>Prosperous Arunachal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <OverviewCard title="Growers by District" href="/statistics#growers" delay={0}>
          {hasGrowers ? (
            <>
              <div className="relative h-[132px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart key="growers-pie">
                    <Pie
                      data={stats.growersByDistrict}
                      cx="50%"
                      cy="50%"
                      innerRadius="58%"
                      outerRadius="90%"
                      paddingAngle={2}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {stats.growersByDistrict.map((entry, i) => (
                        <Cell key={entry.name} fill={DISTRICT_COLORS[i % DISTRICT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="text-center leading-none">
                    <div className="text-lg font-extrabold text-[#0b4a2e]">{stats.totalGrowers.toLocaleString("en-IN")}</div>
                    <div className="mt-0.5 text-[9px] text-muted">Growers</div>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-2.5 gap-y-1">
                {stats.growersByDistrict.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 shrink-0 rounded-full" style={{ backgroundColor: DISTRICT_COLORS[i % DISTRICT_COLORS.length] }} />
                    <span className="text-[9px] text-muted">{item.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </OverviewCard>

        <OverviewCard title="Tea Area by District" href="/statistics#area" delay={0.05}>
          {hasArea ? (
            <div className="h-[152px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart key="area-bar" data={stats.areaByDistrict} margin={{ top: 4, right: 0, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8f0ea" vertical={false} />
                  <XAxis dataKey="name" tick={TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={TICK} axisLine={false} tickLine={false} width={34} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${Number(value).toLocaleString("en-IN")} Ha`, "Area"]} />
                  <Bar dataKey="area" fill="#15803d" radius={[3, 3, 0, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState />
          )}
        </OverviewCard>

        <OverviewCard title="Growers Distribution" subtitle="District-wise registered growers" href="/statistics#growers" delay={0.1}>
          <DistrictMap growers={stats.growersByDistrict} area={stats.areaByDistrict} />
        </OverviewCard>

        <OverviewCard title="Organic vs Conventional" href="/statistics#organic" delay={0.15}>
          {organicTotal > 0 ? (
            <>
              <div className="relative h-[132px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart key="organic-pie">
                    <Pie
                      data={organicData}
                      cx="50%"
                      cy="50%"
                      innerRadius="62%"
                      outerRadius="92%"
                      paddingAngle={3}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {organicData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="text-center leading-none">
                    <div className="text-lg font-extrabold text-[#0b4a2e]">{organicShare}%</div>
                    <div className="mt-0.5 text-[9px] text-muted">Organic</div>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-2.5 gap-y-1">
                {organicData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[9px] text-muted">
                      {item.name} ({organicTotal > 0 ? Math.round((item.value / organicTotal) * 100) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </OverviewCard>

        <OverviewCard
          title="Annual Green Leaf"
          subtitle="Monthly production cycle from recorded data"
          href="/statistics#production"
          delay={0.2}
          headerRight={
            <div className="flex items-center gap-1 shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-[#15803d]" />
              <span className="text-[11px] font-bold text-[#15803d]">{stats.annualProduction.toLocaleString("en-IN")} Kg</span>
            </div>
          }
        >
          {hasProduction ? (
            <div className="h-[152px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart key="annual-area" data={stats.monthlyProduction} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8f0ea" vertical={false} />
                  <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={TICK} axisLine={false} tickLine={false} width={34} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${Number(value).toLocaleString("en-IN")} MT`, "Production"]} />
                  <defs>
                    <linearGradient id="overviewAnnualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#86efac" stopOpacity={0.85} />
                      <stop offset="100%" stopColor="#bbf7d0" stopOpacity={0.15} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="prod"
                    stroke="#0b4a2e"
                    strokeWidth={2}
                    fill="url(#overviewAnnualGradient)"
                    activeDot={{ r: 3, fill: "#0b4a2e" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState />
          )}
        </OverviewCard>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex h-[152px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#86efac]/80 bg-white/50 px-3 text-center backdrop-blur-sm">
      <Sprout className="w-4 h-4 text-[#15803d]" />
      <p className="text-[10px] font-medium text-muted">Data will appear as growers register</p>
    </div>
  );
}

function OverviewCard({
  title,
  subtitle,
  href,
  children,
  delay = 0,
  headerRight,
}: {
  title: string;
  subtitle?: string;
  href: string;
  children: React.ReactNode;
  delay?: number;
  headerRight?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="h-full"
    >
      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-4 shadow-[0_10px_30px_-18px_rgba(11,74,46,0.45)] backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/85 hover:shadow-[0_18px_44px_-20px_rgba(11,74,46,0.5)]">
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
          aria-hidden="true"
        />
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[12.5px] font-bold text-[#0b4a2e] leading-tight">{title}</h3>
          {headerRight}
        </div>
        {subtitle && <p className="mt-0.5 text-[10px] text-muted leading-snug">{subtitle}</p>}
        <div className="mt-3 flex-1 min-h-0">{children}</div>
        <Link
          href={href}
          className="mt-3 inline-flex items-center gap-1 self-start text-[11px] font-semibold text-[#15803d] hover:text-[#0b4a2e] transition-all group-hover:gap-1.5"
        >
          View Details <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}
