"use client";

import { useState, useCallback } from "react";
import { Eye, Edit3, Trash2, ChevronLeft, ChevronRight, Search, User, X } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";

const statusStyles: Record<string, string> = { APPROVED: "bg-green-100 text-green-700", PENDING: "bg-orange-100 text-orange-700", REJECTED: "bg-red-100 text-red-700" };

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onCancel}>
      <div className="bg-white rounded-[14px] shadow-xl p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-medium text-foreground mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 text-xs font-medium rounded-[8px] bg-gray-100 text-muted hover:text-foreground">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-1.5 text-xs font-medium rounded-[8px] bg-red-600 text-white hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ grower, onClose }: { grower: any; onClose: () => void }) {
  if (!grower) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-[14px] shadow-xl p-6 max-w-lg mx-4 w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">Grower Details</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><span className="text-muted">Name:</span> <span className="font-medium">{grower.name}</span></div>
          <div><span className="text-muted">Mobile:</span> <span className="font-medium">{grower.mobile}</span></div>
          <div><span className="text-muted">District:</span> <span className="font-medium">{grower.district?.name}</span></div>
          <div><span className="text-muted">Village:</span> <span className="font-medium">{grower.village?.name}</span></div>
          <div><span className="text-muted">Status:</span> <span className={`font-medium ${grower.status === "APPROVED" ? "text-green-600" : grower.status === "PENDING" ? "text-orange-600" : "text-red-600"}`}>{grower.status}</span></div>
          <div><span className="text-muted">Tea Area:</span> <span className="font-medium">{grower.teaArea} Ha</span></div>
        </div>
        <div className="mt-4 pt-3 border-t border-border flex justify-end">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium rounded-[8px] bg-gray-100 text-muted hover:text-foreground">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function RecentRegistrations() {
  const { data, loading, error } = useDashboard();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any>(null);

  const tableData = data?.recentRegistrations;
  const rows = tableData?.rows || [];
  const total = tableData?.total || 0;
  const limit = tableData?.limit || 6;

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/admin/growers/${deleteTarget}`, { method: "DELETE" });
      setDeleteTarget(null);
    } catch { setDeleteTarget(null); }
  }, [deleteTarget]);

  const handleView = useCallback(async (id: string) => {
    setDetailId(id);
    try {
      const res = await fetch(`/api/admin/growers/${id}`);
      const json = await res.json();
      setDetailData(json);
    } catch { setDetailData(null); }
  }, []);

  return (
    <div className="bg-white rounded-[12px] border border-border shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-foreground">Recent Registrations</h3>
          <p className="text-[11px] text-muted">Latest grower registration requests</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted" />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-24 h-7 pl-7 pr-2 rounded-[8px] bg-gray-50 border border-border text-[11px] outline-none focus:border-[#0B4A2E]/30" />
          </div>
          <button className="text-xs font-medium text-[#0B4A2E] hover:underline">View All</button>
        </div>
      </div>
      <div className="overflow-auto flex-1 min-h-0">
        {loading ? (
          <div className="p-4 space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-8 bg-gray-100 rounded" />)}
          </div>
        ) : error ? (
          <div className="p-4 text-xs text-center text-muted">Failed to load data</div>
        ) : !rows.length ? (
          <div className="p-8 text-xs text-center text-muted">No growers registered yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-border">
                {["Grower Name", "District", "Village", "Phone", "Reg. Date", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-muted px-3 py-2 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any, i: number) => (
                <tr key={r.id || i} className="border-t border-border hover:bg-gray-50/50 transition-colors">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <span className="text-xs font-medium text-foreground">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted">{r.district}</td>
                  <td className="px-3 py-2 text-xs text-muted">{r.village}</td>
                  <td className="px-3 py-2 text-xs text-muted">{r.phone}</td>
                  <td className="px-3 py-2 text-xs text-muted">{r.date}</td>
                  <td className="px-3 py-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[r.status] || ""}`}>{r.status}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleView(r.id)} className="w-7 h-7 rounded-full hover:bg-gray-100 text-muted hover:text-foreground flex items-center justify-center"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 rounded-full hover:bg-emerald-50 text-muted hover:text-emerald-600 flex items-center justify-center"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteTarget(r.id)} className="w-7 h-7 rounded-full hover:bg-red-50 text-muted hover:text-red-600 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {!loading && !error && rows.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border shrink-0">
          <span className="text-[11px] text-muted">Showing {Math.min((page - 1) * limit + 1, total)}-{Math.min(page * limit, total)} of {total}</span>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-1 rounded-lg hover:bg-gray-100 text-muted disabled:opacity-30"><ChevronLeft className="w-3 h-3" /></button>
            {[1, 2, 3].map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-6 h-6 rounded-lg text-xs font-bold ${p === page ? "bg-[#0B4A2E] text-white" : "hover:bg-gray-100 text-muted"}`}>{p}</button>
            ))}
            <button disabled={page * limit >= total} onClick={() => setPage((p) => p + 1)} className="p-1 rounded-lg hover:bg-gray-100 text-muted disabled:opacity-30"><ChevronRight className="w-3 h-3" /></button>
          </div>
        </div>
      )}

      {deleteTarget && <ConfirmDialog message="Are you sure you want to delete this grower? This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
      {detailData && <DetailModal grower={detailData} onClose={() => { setDetailData(null); setDetailId(null); }} />}
    </div>
  );
}
