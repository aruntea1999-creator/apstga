"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Eye, CheckCircle, XCircle, Loader2, User } from "lucide-react";
import PageShell from "@/components/admin/page-shell";
import SkeletonTable from "@/components/admin/skeleton-table";

export default function RegistrationsPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setQueue(json.pendingVerifications || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const handleApprove = async (id: string) => {
    setVerifying(id);
    try {
      const res = await fetch(`/api/admin/growers/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      setQueue((prev) => prev.filter((g) => g.id !== id));
      setToast({ type: "success", text: "Grower approved successfully" });
    } catch {
      setToast({ type: "error", text: "Failed to approve grower" });
    } finally {
      setVerifying(null);
    }
  };

  const handleReject = async (id: string) => {
    setVerifying(id);
    try {
      const res = await fetch(`/api/admin/growers/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      setQueue((prev) => prev.filter((g) => g.id !== id));
      setToast({ type: "success", text: "Grower registration rejected" });
    } catch {
      setToast({ type: "error", text: "Failed to reject grower" });
    } finally {
      setVerifying(null);
    }
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  return (
    <PageShell
      title="Registration Requests"
      description="Review and approve grower registrations"
      segments={[{ label: "Dashboard", href: "/admin" }, { label: "Registrations" }]}
    >
      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-[12px] text-sm flex items-center gap-2 ${
          toast.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          {toast.text}
        </div>
      )}

      <div className="bg-white rounded-[12px] border border-border shadow-sm flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">Pending Verifications</h3>
          <p className="text-[11px] text-muted mt-0.5">Review and take action on pending registration requests</p>
        </div>

        {loading ? (
          <div className="p-4"><SkeletonTable rows={5} cols={5} /></div>
        ) : error ? (
          <div className="p-12 text-xs text-center text-muted">{error}</div>
        ) : !queue.length ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-10 h-10 text-emerald-400 mb-3" />
            <p className="text-sm font-medium text-foreground">No pending registrations</p>
            <p className="text-xs text-muted mt-1">All grower registration requests have been processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  {["Grower", "District", "Pending Verifications", "Requested", "Actions"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-muted px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queue.map((item: any, i: number) => (
                  <tr key={item.id || i} className="border-b border-border hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-xs font-medium text-foreground">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{item.district}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(item.verifications || []).map((v: string) => (
                          <span key={v} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                            {v}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {item.registeredAt ? new Date(item.registeredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleApprove(item.id)}
                          disabled={verifying === item.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-[8px] bg-[#0B4A2E] text-white text-[11px] font-semibold hover:bg-[#0A3D26] disabled:opacity-50 transition-colors"
                        >
                          {verifying === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          disabled={verifying === item.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-[8px] border border-red-200 text-red-600 text-[11px] font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          {verifying === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                          Reject
                        </button>
                        <Link
                          href={`/admin/registrations/${item.id}`}
                          className="w-7 h-7 rounded-full hover:bg-gray-100 text-muted hover:text-foreground flex items-center justify-center"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  );
}
