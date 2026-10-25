"use client";

import { useState } from "react";
import { User, ArrowRight, Loader2 } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";

export default function VerificationQueue() {
  const { data, loading, error, refetch } = useDashboard();
  const [verifying, setVerifying] = useState<string | null>(null);
  const queue = data?.pendingVerifications || [];

  const handleVerify = async (id: string) => {
    setVerifying(id);
    try {
      await fetch(`/api/admin/growers/${id}/verify`, { method: "PATCH" });
      refetch();
    } catch {
      // ignore
    } finally {
      setVerifying(null);
    }
  };

  if (error) return null;

  return (
    <div className="bg-white rounded-[12px] border border-border shadow-sm p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-sm font-bold text-foreground">Pending Verification</h3>
        <button className="text-xs font-medium text-[#0B4A2E] hover:underline">View All</button>
      </div>
      {loading ? (
        <div className="space-y-2 flex-1 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-[10px] bg-gray-50/50 border border-border/50">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="h-2.5 bg-gray-200 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : !queue.length ? (
        <div className="flex-1 flex items-center justify-center text-xs text-muted">No pending verifications</div>
      ) : (
        <div className="space-y-2 flex-1 overflow-hidden">
          {queue.map((item: any, i: number) => (
            <div key={item.id || i} className="flex items-center gap-2 p-2 rounded-[10px] bg-gray-50/50 border border-border/50">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                <p className="text-[10px] text-muted truncate">{item.district}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="flex flex-wrap gap-1 justify-end">
                  {item.verifications.map((v: string) => (
                    <span key={v} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 whitespace-nowrap">{v}</span>
                  ))}
                </div>
                <button
                  onClick={() => handleVerify(item.id)}
                  disabled={verifying === item.id}
                  className="flex items-center gap-0.5 text-xs font-semibold text-white bg-[#0B4A2E] hover:bg-[#0A3D26] px-2.5 py-1 rounded-[6px] transition-colors disabled:opacity-50"
                >
                  {verifying === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
                  Verify
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
