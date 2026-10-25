"use client";

import { useEffect, useState } from "react";
import { Database, Clock, HardDrive, AlertTriangle, Table2 } from "lucide-react";
import PageShell from "@/components/admin/page-shell";

type BackupStatus = {
  databaseSize: string;
  lastBackup: null;
  storageNote: string;
  tables: { table: string; rows: number }[];
  totalRows: number;
};

export default function BackupPage() {
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/backup");
      if (!res.ok) throw new Error("Failed to load");
      setStatus(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  return (
    <PageShell
      title="Database Backup"
      description="View live database status — automated backups are handled by the hosting provider"
      segments={[{ label: "Dashboard", href: "/admin" }, { label: "Backup" }]}
    >
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[12px] border border-border shadow-sm p-5 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-100 mb-3" />
                <div className="h-6 bg-gray-100 rounded w-16 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-24" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-[12px] border border-border shadow-sm p-10 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-xs text-muted">Failed to load backup status</p>
          <button onClick={fetchStatus} className="mt-4 h-8 px-4 rounded-[8px] bg-[#0B4A2E] text-white text-[11px] font-semibold">
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-[12px] border border-border shadow-sm p-5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <Database className="w-5 h-5 text-[#0B4A2E]" />
              </div>
              <div className="text-xl font-extrabold text-foreground">{status?.databaseSize}</div>
              <div className="text-[11px] text-muted mt-0.5">Database Size</div>
            </div>
            <div className="bg-white rounded-[12px] border border-border shadow-sm p-5">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <Table2 className="w-5 h-5 text-blue-700" />
              </div>
              <div className="text-xl font-extrabold text-foreground">{status?.totalRows?.toLocaleString() ?? "0"}</div>
              <div className="text-[11px] text-muted mt-0.5">Total Records</div>
            </div>
            <div className="bg-white rounded-[12px] border border-border shadow-sm p-5">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                <HardDrive className="w-5 h-5 text-purple-700" />
              </div>
              <div className="text-xl font-extrabold text-foreground">{status?.storageNote}</div>
              <div className="text-[11px] text-muted mt-0.5">Storage Management</div>
            </div>
          </div>

          <div className="bg-white rounded-[12px] border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-[#0B4A2E]" />
              <h3 className="text-sm font-bold text-foreground">Backup Information</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              This portal runs on a hosted PostgreSQL database. Point-in-time backups, automatic daily snapshots, and restore
              operations are managed by the hosting provider and are not exposed through this panel.
            </p>
          </div>

          <div className="bg-white rounded-[12px] border border-border shadow-sm">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Live Table Statistics</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="text-left text-[11px] font-semibold text-muted px-4 py-3">Table</th>
                    <th className="text-left text-[11px] font-semibold text-muted px-4 py-3">Records</th>
                  </tr>
                </thead>
                <tbody>
                  {status?.tables.map((t) => (
                    <tr key={t.table} className="border-b border-border hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-foreground font-medium">{t.table}</td>
                      <td className="px-4 py-3 text-xs text-muted">{t.rows.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}