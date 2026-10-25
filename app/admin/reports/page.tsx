"use client";

import { useEffect, useState } from "react";
import { BarChart3, CalendarDays, TrendingUp, Sliders, FileText, AlertTriangle } from "lucide-react";
import PageShell from "@/components/admin/page-shell";

const reportTypes = [
  { id: "district", title: "District Reports", desc: "Growers, tea area and production grouped by district", icon: BarChart3, color: "bg-blue-100 text-blue-700" },
  { id: "monthly", title: "Monthly Reports", desc: "New grower registrations per month", icon: CalendarDays, color: "bg-emerald-100 text-emerald-700" },
  { id: "yearly", title: "Yearly Reports", desc: "Annual registration totals", icon: TrendingUp, color: "bg-purple-100 text-purple-700" },
  { id: "custom", title: "Growers Report", desc: "Full grower register as CSV", icon: Sliders, color: "bg-orange-100 text-orange-700" },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (id: string) => {
    setGenerating(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports?type=${id}&year=${new Date().getFullYear()}`);
      if (!res.ok) throw new Error("Failed to generate report");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${id}-report.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(null);
    }
  };

  useEffect(() => { setError(null); }, []);

  return (
    <PageShell
      title="Reports"
      description="Generate and download live reports as CSV"
      segments={[{ label: "Dashboard", href: "/admin" }, { label: "Reports" }]}
    >
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-[12px] p-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-xs text-red-700">Failed to generate report</span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white rounded-[12px] border border-border shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl ${report.color} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">{report.title}</h3>
              <p className="text-xs text-muted mb-4">{report.desc}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerate(report.id)}
                  disabled={generating !== null}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] bg-[#0B4A2E] text-white text-[11px] font-semibold hover:bg-[#0A3D26] transition-colors disabled:opacity-50"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {generating === report.id ? "Generating..." : "Download CSV"}
                </button>
                <span className="text-[10px] text-muted">Live data</span>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
