"use client";

import { Clock, UserPlus, CreditCard, FileText, MapPin } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";

const iconMap: Record<string, typeof UserPlus> = { user_plus: UserPlus, credit_card: CreditCard, file_text: FileText, map_pin: MapPin };
const colorMap: Record<string, string> = { user_plus: "text-emerald-600 bg-emerald-50", credit_card: "text-blue-600 bg-blue-50", file_text: "text-amber-600 bg-amber-50", map_pin: "text-purple-600 bg-purple-50" };

function Skeleton() {
  return (
    <div className="space-y-2 flex-1 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gray-200" />
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-2.5 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationsCard() {
  const { data, loading, error } = useDashboard();
  const activities = data?.notifications || [];

  if (error) return null;

  return (
    <div className="bg-white rounded-[12px] border border-border shadow-sm p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-sm font-bold text-foreground">Notifications</h3>
        <button className="text-xs font-medium text-[#0B4A2E] hover:underline">View All</button>
      </div>
      {loading ? <Skeleton /> : !activities.length ? (
        <div className="flex-1 flex items-center justify-center text-xs text-muted">No notifications yet</div>
      ) : (
        <div className="space-y-2 flex-1 overflow-hidden">
          {activities.map((a: any, i: number) => {
            const Icon = iconMap[a.type] || UserPlus;
            const colors = colorMap[a.type] || "text-gray-600 bg-gray-50";
            return (
              <div key={i} className="flex items-start gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${colors}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate leading-tight">{a.title}</p>
                  <p className="text-[10px] text-muted truncate leading-tight">{a.detail}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted shrink-0 whitespace-nowrap">
                  <Clock className="w-3 h-3" />{a.time}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
