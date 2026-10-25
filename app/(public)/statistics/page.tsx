"use client";

import { useEffect, useState } from "react";
import { Users, MapPin, Leaf, Sprout, CalendarDays, Loader2, TrendingUp, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, Area } from "recharts";

type StatsData = {
  totalGrowers: number;
  teaArea: number;
  annualProduction: number;
  organicGrowers: number;
  conventionalGrowers: number;
  growersByDistrict: { name: string; value: number }[];
  areaByDistrict: { name: string; area: number }[];
  monthlyProduction: { month: string; prod: number }[];
  notices: { title: string; date: string; tag: string }[];
};

const COLORS = ["#0B4A2E", "#1F7A6C", "#6B4FA0", "#D98B34", "#8FBF8F", "#C4C4C4"];

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-[16px] border border-border shadow-sm p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="text-3xl font-extrabold text-foreground tracking-tight">{value}</div>
      <div className="text-sm font-semibold text-foreground mt-1">{label}</div>
      <div className="text-xs text-muted mt-0.5">{sub}</div>
    </div>
  );
}

function SectionCard({ id, title, icon: Icon, children }: { id: string; title: string; icon: any; children: React.ReactNode }) {
  return (
    <div id={id} className="bg-white rounded-[16px] border border-border shadow-sm p-6 md:p-8 scroll-mt-28">
      <h2 className="text-lg md:text-xl font-bold text-foreground mb-5 flex items-center gap-2">
        <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </span>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setStats(json);
      })
      .catch((e) => setError(e.message || "Failed to load statistics"))
      .finally(() => setLoading(false));
  }, []);

  const organicData = [
    { name: "Conventional", value: stats?.conventionalGrowers ?? 0, color: "#FF9933" },
    { name: "Organic", value: stats?.organicGrowers ?? 0, color: "#0B4A2E" },
  ];
  const organicTotal = organicData.reduce((s, d) => s + d.value, 0);

  return (
    <section className="bg-white py-20">
      <div className="w-full max-w-[1000px] mx-auto px-8 lg:px-12 xl:px-16">
        <div className="text-center mb-12">
          <h1 className="text-[40px] md:text-[48px] font-extrabold text-foreground leading-[1.1] tracking-[-0.02em] mb-3">
            <span className="text-primary">Statistics</span>
          </h1>
          <p className="text-muted text-[16px] max-w-xl mx-auto">
            Tea sector statistics and data for Arunachal Pradesh.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : error ? (
          <p className="text-center text-sm text-red-600">{error}</p>
        ) : stats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Registered Growers" value={stats.totalGrowers.toLocaleString("en-IN")} sub="Approved members" />
              <StatCard icon={MapPin} label="Tea Area" value={`${stats.teaArea.toLocaleString("en-IN")} Ha`} sub="Registered tea gardens" />
              <StatCard icon={Leaf} label="Annual Production" value={`${stats.annualProduction.toLocaleString("en-IN")} Kg`} sub="Green leaf per year" />
              <StatCard icon={Sprout} label="Organic Growers" value={`${stats.organicGrowers.toLocaleString("en-IN")} (${organicTotal > 0 ? Math.round((stats.organicGrowers / organicTotal) * 100) : 0}%)`} sub="Certified organic" />
            </div>

            <SectionCard id="growers" title="Growers by District" icon={Users}>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.growersByDistrict}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" name="Growers" fill="#0B4A2E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard id="area" title="Tea Area by District" icon={MapPin}>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.areaByDistrict}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="area" name="Area (Ha)" fill="#1F7A6C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard id="production" title="Monthly Production Trend" icon={TrendingUp}>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={stats.monthlyProduction}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <defs>
                      <linearGradient id="publicProductionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0B4A2E" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#0B4A2E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="prod" fill="url(#publicProductionGradient)" stroke="none" />
                    <Line type="monotone" dataKey="prod" name="Production (Kg)" stroke="#0B4A2E" strokeWidth={2} dot={{ fill: "#0B4A2E", r: 3, strokeWidth: 0 }} activeDot={{ r: 4, fill: "#0B4A2E" }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard id="organic" title="Organic vs Conventional" icon={Sprout}>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="h-[260px] w-full md:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={organicData} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" paddingAngle={3} dataKey="value">
                        {organicData.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-3">
                  {organicData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between bg-gray-50 rounded-[10px] px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-foreground">{item.value.toLocaleString("en-IN")}</div>
                        <div className="text-xs text-muted">{organicTotal > 0 ? Math.round((item.value / organicTotal) * 100) : 0}%</div>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-muted leading-relaxed pt-1">
                    Share of registered growers following organic tea cultivation practices in Arunachal Pradesh.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard id="notices" title="Latest Events & News" icon={BarChart3}>
              {!stats.notices?.length ? (
                <p className="text-sm text-muted text-center py-6">No notices yet.</p>
              ) : (
                <div className="space-y-3">
                  {stats.notices.map((n, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-[10px] px-4 py-3">
                      <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                        <p className="text-xs text-muted">{n.date}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full shrink-0">{n.tag}</span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        ) : null}
      </div>
    </section>
  );
}