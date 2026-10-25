"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, MapPin, Leaf, Package, TrendingUp } from "lucide-react";
import PageShell from "@/components/admin/page-shell";
import { GrowthChart, DistrictChart } from "@/components/admin/analytics-charts";
import { useDashboard, DashboardContext } from "@/lib/dashboard-context";
import type { DashboardData } from "@/lib/dashboard-context";

function StatSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-[12px] border border-border shadow-sm p-4 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-gray-200 mb-3" />
          <div className="h-7 bg-gray-200 rounded w-16 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

function StatError() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-[12px] border border-border shadow-sm p-4 flex items-center justify-center text-xs text-muted">—</div>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-[12px] border border-border shadow-sm p-4">
      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-[#0B4A2E]" />
      </div>
      <div className="text-2xl font-extrabold text-foreground">{value}</div>
      <div className="text-sm font-medium text-[#0B4A2E] mt-0.5">{label}</div>
      <div className="text-[11px] text-muted mt-0.5">{sub}</div>
    </div>
  );
}

function InnerContent() {
  const { data, loading, error } = useDashboard();
  const kpi = data?.kpi;

  return (
    <div className="space-y-6">
      {loading ? (
        <StatSkeleton />
      ) : error || !kpi ? (
        <StatError />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Growers" value={kpi.registeredGrowers.value.toLocaleString()} sub={`${kpi.registeredGrowers.trend} vs last month`} />
          <StatCard icon={MapPin} label="Districts Covered" value={String(kpi.districtsCovered.value)} sub="Across Arunachal Pradesh" />
          <StatCard icon={Leaf} label="Total Tea Area" value={`${kpi.totalTeaArea.value.toLocaleString()} Ha`} sub="Registered tea gardens" />
          <StatCard icon={Package} label="Total Production" value={`${(kpi.totalProduction?.value ?? 0).toLocaleString()} Kg`} sub="Annual green leaf" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="h-[320px]">
          <GrowthChart />
        </div>
        <div className="h-[320px]">
          <DistrictChart />
        </div>
      </div>

      <div className="bg-white rounded-[12px] border border-border shadow-sm p-5">
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#0B4A2E]" /> Monthly Trends
        </h3>
        {loading ? (
          <div className="h-48 bg-gray-50 rounded-[10px] animate-pulse" />
        ) : error ? (
          <div className="h-48 flex items-center justify-center text-xs text-muted">Failed to load</div>
        ) : !data?.growthChart?.length ? (
          <div className="h-48 flex items-center justify-center text-xs text-muted">No data available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="text-left text-[11px] font-semibold text-muted px-4 py-2.5">Month</th>
                  <th className="text-left text-[11px] font-semibold text-muted px-4 py-2.5">New Growers</th>
                  <th className="text-left text-[11px] font-semibold text-muted px-4 py-2.5">Growth %</th>
                </tr>
              </thead>
              <tbody>
                {data.growthChart.map((m: any, i: number) => {
                  const prev = i > 0 ? data.growthChart[i - 1].growers : m.growers;
                  const pct = prev > 0 ? ((m.growers - prev) / prev * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={m.month} className="border-b border-border hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 text-xs font-medium text-foreground">{m.month}</td>
                      <td className="px-4 py-2.5 text-xs text-muted">{m.growers.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-xs">
                        <span className={`font-semibold ${Number(pct) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {Number(pct) >= 0 ? "+" : ""}{pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <DashboardContext.Provider value={{ data, loading, error, refetch: fetchData }}>
      <PageShell
        title="Statistics & Analytics"
        description="Overview of growers, tea area, and production"
        segments={[{ label: "Dashboard", href: "/admin" }, { label: "Statistics" }]}
      >
        <InnerContent />
      </PageShell>
    </DashboardContext.Provider>
  );
}
