"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, MapPin, Sprout, Leaf } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

type StatsData = {
  totalGrowers: number;
  teaArea: number;
  annualProduction: number;
  organicGrowers: number;
  conventionalGrowers: number;
  growersByDistrict: { name: string; value: number }[];
  monthlyProduction: { month: string; prod: number }[];
};

const EMPTY_STATS: StatsData = {
  totalGrowers: 0,
  teaArea: 0,
  annualProduction: 0,
  organicGrowers: 0,
  conventionalGrowers: 0,
  growersByDistrict: [],
  monthlyProduction: [],
};

function AnimatedNumber({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView) return;
    const duration = 1500, steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => { current += increment; if (current >= value) { setCount(value); clearInterval(timer); } else { setCount(Math.floor(current)); } }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);
  return <div ref={ref} className="text-lg md:text-xl font-bold text-foreground">{count.toLocaleString("en-IN")}</div>;
}

export default function StatsSection() {
  const [stats, setStats] = useState<StatsData>(EMPTY_STATS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => { if (!json.error) setStats(json); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const organicData = [
    { name: "Conventional", value: stats.conventionalGrowers, color: "#FF9933" },
    { name: "Organic", value: stats.organicGrowers, color: "#0B4A2E" },
  ];
  const totalOrganic = organicData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 h-full">
      <StatCard icon={Users} value={stats.totalGrowers} label="Registered Growers" color="text-primary" bgColor="bg-primary/10" delay={0}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart key={`growers-bar-${loaded}`} data={stats.growersByDistrict} margin={{ top: 4, right: 2, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
            <Bar dataKey="value" fill="#0B4A2E" radius={[2, 2, 0, 0]} maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </StatCard>

      <StatCard icon={MapPin} value={stats.teaArea} label="Tea Area (Ha)" color="text-secondary" bgColor="bg-secondary/10" delay={0.06}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart key={`area-bar-${loaded}`} data={stats.growersByDistrict} margin={{ top: 4, right: 2, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
            <Bar dataKey="value" fill="#1F7A6C" radius={[2, 2, 0, 0]} maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </StatCard>

      <StatCard icon={Sprout} value={stats.annualProduction} label="Annual Green Leaf (Kg)" color="text-primary" bgColor="bg-primary/10" delay={0.12}>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart key={`prod-line-${loaded}`} data={stats.monthlyProduction} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <Line type="monotone" dataKey="prod" stroke="#0B4A2E" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </StatCard>

      <StatCard icon={Leaf} value={stats.organicGrowers} label="Organic Growers" color="text-secondary" bgColor="bg-secondary/10" delay={0.18}>
        <div className="flex items-center justify-center h-full">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart key={`organic-pie-${loaded}`}>
              <Pie data={organicData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value" isAnimationActive={false}>
                {organicData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-3 justify-center mt-1">
          {organicData.map((item) => (
            <div key={item.name} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[9px] text-muted">
                {item.name} ({totalOrganic > 0 ? Math.round((item.value / totalOrganic) * 100) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </StatCard>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color, bgColor, delay, children }: {
  icon: any; value: number; label: string; color: string; bgColor: string; delay: number; children: React.ReactNode;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }} viewport={{ once: true }}
      className="rounded-[12px] border border-border bg-white p-[11px] hover:shadow-sm transition-shadow flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-1.5">
        <div className={`w-9 h-9 ${bgColor} rounded-[8px] flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <AnimatedNumber value={value} />
      <div className="text-[11px] text-muted mb-1.5">{label}</div>
      <div className="flex flex-col flex-1">{children}</div>
    </motion.div>
  );
}
