"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MapPin, Users, Leaf, ArrowRight } from "lucide-react";
import PageShell from "@/components/admin/page-shell";
import { DashboardContext } from "@/lib/dashboard-context";
import type { DashboardData } from "@/lib/dashboard-context";

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-[12px] border border-border shadow-sm p-5 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-gray-200 mb-3" />
          <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

export default function DistrictsPage() {
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

  const districts = data?.mapData || [];

  return (
    <PageShell
      title="District Analytics"
      description="Explore data by district"
      segments={[{ label: "Dashboard", href: "/admin" }, { label: "Districts" }]}
    >
      {loading ? (
        <SkeletonGrid />
      ) : error ? (
        <div className="bg-white rounded-[12px] border border-border shadow-sm p-12 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : !districts.length ? (
        <div className="bg-white rounded-[12px] border border-border shadow-sm p-12 text-center">
          <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No district data available</p>
          <p className="text-xs text-muted mt-1">District analytics will appear once growers are registered.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {districts.map((d: any) => (
            <Link
              key={d.district}
              href={`/admin/districts/${encodeURIComponent(d.district)}`}
              className="bg-white rounded-[12px] border border-border shadow-sm p-5 hover:shadow-md hover:border-[#0B4A2E]/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5 text-[#0B4A2E]" />
              </div>
              <h3 className="text-base font-bold text-foreground group-hover:text-[#0B4A2E] transition-colors">{d.district}</h3>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Users className="w-3.5 h-3.5" />
                  <span>{d.growers} grower{d.growers !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>{d.areaHa} Ha tea area</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-[#0B4A2E] opacity-0 group-hover:opacity-100 transition-opacity">
                View details <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
