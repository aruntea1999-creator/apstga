"use client";

import { Users, MapPin, Clock, Leaf } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";

function Skeleton() {
  return (
    <div className="grid grid-cols-4 gap-4 h-full">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-[12px] border border-border shadow-sm p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="mt-3 h-8 bg-gray-200 rounded w-16" />
          <div className="mt-2 h-4 bg-gray-200 rounded w-32" />
        </div>
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="grid grid-cols-4 gap-4 h-full">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-[12px] border border-border shadow-sm p-4 flex items-center justify-center text-xs text-muted">
          —
        </div>
      ))}
    </div>
  );
}

export default function DashboardCards() {
  const { data, loading, error } = useDashboard();

  if (loading) return <Skeleton />;
  if (error || !data) return <ErrorState />;

  const kpi = data.kpi;
  const cards = [
    { title: "Registered Growers", value: kpi.registeredGrowers.value.toLocaleString(), change: kpi.registeredGrowers.trend, up: kpi.registeredGrowers.trend.startsWith("+"), icon: Users },
    { title: "Districts Covered", value: String(kpi.districtsCovered.value), change: "Total", up: true, icon: MapPin },
    { title: "Pending Registrations", value: String(kpi.pendingRegistrations.value), change: kpi.pendingRegistrations.trend, up: false, icon: Clock },
    { title: "Total Tea Area", value: `${kpi.totalTeaArea.value.toLocaleString()} Ha`, change: kpi.totalTeaArea.trend, up: kpi.totalTeaArea.trend.startsWith("+"), icon: Leaf },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 h-full">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const isOrange = !card.up;
        return (
          <div key={card.title} className="bg-white rounded-[12px] border border-border shadow-sm p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isOrange ? "bg-orange-100" : "bg-emerald-100"}`}>
                <Icon className={`w-5 h-5 ${isOrange ? "text-orange-600" : "text-[#0B4A2E]"}`} />
              </div>
              <span className={`text-[13px] font-semibold ${isOrange ? "text-orange-600" : "text-[#0B4A2E]"}`}>{card.title}</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-extrabold text-foreground">{card.value}</div>
            </div>
            <div className="flex items-center mt-1">
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${isOrange ? "text-orange-600" : "text-emerald-600"}`}>
                {card.change}
              </span>
              <span className="text-muted font-normal text-xs ml-1">vs last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
