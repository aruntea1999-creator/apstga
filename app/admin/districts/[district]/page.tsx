"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Users, Leaf, Package, User } from "lucide-react";
import PageShell from "@/components/admin/page-shell";
import { DashboardContext } from "@/lib/dashboard-context";
import type { DashboardData } from "@/lib/dashboard-context";

export default function DistrictDetailPage() {
  const params = useParams();
  const districtName = params?.district as string;
  const decoded = decodeURIComponent(districtName || "");

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

  const districtInfo = data?.mapData?.find((d: any) => d.district === decoded);
  const growers = data?.recentRegistrations?.rows?.filter((r: any) => r.district === decoded) || [];

  if (loading) {
    return (
      <PageShell title="District Detail" segments={[{ label: "Dashboard", href: "/admin" }, { label: "Districts", href: "/admin/districts" }, { label: "Loading..." }]}>
        <div className="space-y-5 animate-pulse">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[12px] border border-border shadow-sm p-5">
                <div className="w-10 h-10 rounded-full bg-gray-200 mb-3" />
                <div className="h-6 bg-gray-200 rounded w-20 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-[12px] border border-border shadow-sm p-5">
            <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded mb-2" />
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="District Detail" segments={[{ label: "Dashboard", href: "/admin" }, { label: "Districts", href: "/admin/districts" }, { label: "Error" }]}>
        <div className="bg-white rounded-[12px] border border-border shadow-sm p-12 text-center">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <Link href="/admin/districts" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0B4A2E] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Districts
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!districtInfo) {
    return (
      <PageShell title="District Detail" segments={[{ label: "Dashboard", href: "/admin" }, { label: "Districts", href: "/admin/districts" }, { label: "Not Found" }]}>
        <div className="bg-white rounded-[12px] border border-border shadow-sm p-12 text-center">
          <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">District not found</p>
          <p className="text-xs text-muted mt-1 mb-4">No data available for "{decoded}".</p>
          <Link href="/admin/districts" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0B4A2E] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Districts
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={decoded}
      segments={[{ label: "Dashboard", href: "/admin" }, { label: "Districts", href: "/admin/districts" }, { label: decoded }]}
      actions={
        <Link href="/admin/districts" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[10px] border border-border text-xs font-medium text-muted hover:text-foreground hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-[12px] border border-border shadow-sm p-5">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-[#0B4A2E]" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{districtInfo.growers}</div>
            <div className="text-sm font-medium text-[#0B4A2E] mt-0.5">Growers</div>
          </div>
          <div className="bg-white rounded-[12px] border border-border shadow-sm p-5">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
              <Leaf className="w-5 h-5 text-[#0B4A2E]" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{districtInfo.areaHa} Ha</div>
            <div className="text-sm font-medium text-[#0B4A2E] mt-0.5">Tea Area</div>
          </div>
          <div className="bg-white rounded-[12px] border border-border shadow-sm p-5">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
              <Package className="w-5 h-5 text-[#0B4A2E]" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{Number(districtInfo.production).toLocaleString("en-IN")} Kg</div>
            <div className="text-sm font-medium text-[#0B4A2E] mt-0.5">Production</div>
          </div>
        </div>

        <div className="bg-white rounded-[12px] border border-border shadow-sm">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Growers in {decoded}</h3>
          </div>
          {!growers.length ? (
            <div className="p-8 text-xs text-center text-muted">No growers found in this district</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    {["Name", "Village", "Phone", "Status", "Registered Date"].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-muted px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {growers.map((r: any, i: number) => (
                    <tr key={r.id || i} className="border-b border-border hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/admin/growers/${r.id}`} className="flex items-center gap-2.5 hover:text-[#0B4A2E] transition-colors">
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          <span className="text-xs font-medium text-foreground">{r.name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">{r.village}</td>
                      <td className="px-4 py-3 text-xs text-muted">{r.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          r.status === "APPROVED" ? "bg-green-100 text-green-700" : r.status === "PENDING" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                        }`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
