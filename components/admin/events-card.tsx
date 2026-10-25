"use client";

import { useDashboard } from "@/lib/dashboard-context";

const tagColors: Record<string, string> = { Meeting: "bg-blue-100 text-blue-700", Training: "bg-emerald-100 text-emerald-700", Event: "bg-purple-100 text-purple-700", Visit: "bg-amber-100 text-amber-700" };

function Skeleton() {
  return (
    <div className="space-y-2 flex-1 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="w-10 h-10 rounded-[8px] bg-gray-200" />
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-2.5 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EventsCard() {
  const { data, loading, error } = useDashboard();
  const events = data?.events || [];

  if (error) return null;

  return (
    <div className="bg-white rounded-[12px] border border-border shadow-sm p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-sm font-bold text-foreground">Upcoming Events</h3>
        <button className="text-xs font-medium text-[#0B4A2E] hover:underline">View All</button>
      </div>
      {loading ? <Skeleton /> : !events.length ? (
        <div className="flex-1 flex items-center justify-center text-xs text-muted">No upcoming events</div>
      ) : (
        <div className="space-y-2 flex-1 overflow-hidden">
          {events.map((e: any, i: number) => (
            <div key={e.id || i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
              <div className="w-10 h-10 rounded-[8px] bg-gray-50 border border-border flex flex-col items-center justify-center leading-none shrink-0">
                <span className="text-sm font-extrabold text-foreground">{e.day}</span>
                <span className="text-[9px] font-semibold text-muted uppercase">{e.month}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground leading-tight">{e.title}</p>
                <p className="text-[10px] text-muted leading-tight truncate">{e.location}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${tagColors[e.tag] || "bg-gray-100 text-gray-700"}`}>{e.tag}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
