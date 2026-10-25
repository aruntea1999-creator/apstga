"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarDays, RefreshCw } from "lucide-react";
import DashboardCards from "@/components/admin/dashboard-cards";
import { GrowthChart, DistrictChart, ProductionChart, GrowthMap } from "@/components/admin/analytics-charts";
import NotificationsCard from "@/components/admin/notifications-card";
import MembershipRevenueCard from "@/components/admin/membership-revenue-card";
import RecentRegistrations from "@/components/admin/recent-table";
import VerificationQueue from "@/components/admin/verification-queue";
import EventsCard from "@/components/admin/events-card";
import { DashboardContext, DashboardData } from "@/lib/dashboard-context";

function DateDisplay() {
  const now = new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] border border-border bg-white text-xs font-medium text-foreground">
      <CalendarDays className="w-3.5 h-3.5 text-muted" />
      {now.getDate()} {months[now.getMonth()]} {now.getFullYear()}
    </div>
  );
}

export default function AdminDashboard() {
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

  useEffect(() => { if (!data) fetchData(); }, [fetchData, data]);

  return (
    <DashboardContext.Provider value={{ data, loading, error, refetch: fetchData }}>
      <div className="h-full grid grid-rows-[auto_130px_240px_240px_minmax(220px,auto)] gap-2">

        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome Back, <span className="text-[#0B4A2E]">Administrator</span>
            </h1>
            <p className="text-sm text-muted mt-0.5">Here&apos;s today&apos;s overview of APSTGA.</p>
          </div>
          <div className="flex items-center gap-2">
            {!loading && error && (
              <button onClick={fetchData} className="flex items-center gap-1 text-xs text-red-600 hover:underline">
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            )}
            <DateDisplay />
          </div>
        </div>

        <div className="px-6 min-h-0">
          <DashboardCards />
        </div>

        <div className="grid grid-cols-[2fr_2fr_1fr] gap-3 px-6 min-h-0">
          <GrowthChart />
          <DistrictChart />
          <NotificationsCard />
        </div>

        <div className="grid grid-cols-[2fr_2fr_1fr] gap-3 px-6 min-h-0">
          <ProductionChart />
          <GrowthMap />
          <MembershipRevenueCard />
        </div>

        <div className="grid grid-cols-[2fr_1fr_1fr] gap-3 px-6 min-h-0">
          <RecentRegistrations />
          <VerificationQueue />
          <EventsCard />
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
