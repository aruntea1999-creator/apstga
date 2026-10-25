"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  Users,
  MapPin,
  Sprout,
  Loader2,
  FileSpreadsheet,
  FileText,
  AlertCircle,
} from "lucide-react";

type Grower = {
  id: string;
  membershipId: string;
  name: string;
  teaGardenName: string;
  teaArea: number;
  organicStatus: string;
  teaVariety: string;
  plantationYear: number | null;
  district: string;
  village: string;
};

type ExportFormat = "xlsx" | "pdf";

export default function GrowerDirectory() {
  const [query, setQuery] = useState("");
  const [growers, setGrowers] = useState<Grower[]>([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const runSearch = async (term: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/growers?q=${encodeURIComponent(term)}`);
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setGrowers(json.growers || []);
    } catch {
      setGrowers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => runSearch(query), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const download = async (format: ExportFormat) => {
    setExporting(format);
    setExportError(null);
    try {
      const res = await fetch(`/api/growers/export?format=${format}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `apstga-growers-${new Date().toISOString().slice(0, 10)}.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch {
      setExportError("Could not prepare the download. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto">
      {/* Search bar */}
      <div className="flex items-center gap-2 bg-white border border-border rounded-[14px] shadow-sm p-2 pl-4">
        <Search className="w-4.5 h-4.5 text-muted shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by grower name, membership ID or Aadhaar…"
          className="flex-1 h-11 bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setGrowers([]); setSearched(false); }}
            className="text-[11px] text-muted hover:text-foreground px-2"
          >
            Clear
          </button>
        )}
        <button
          onClick={() => runSearch(query)}
          className="h-11 px-5 rounded-[10px] bg-[#0B4A2E] text-white text-sm font-semibold hover:bg-[#0A3D26] transition-colors flex items-center gap-1.5"
        >
          <Search className="w-4 h-4" /> Search
        </button>
      </div>

      {/* Toolbar: count + downloads */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">
          {loading
            ? "Loading growers…"
            : growers.length === 0
              ? "No growers found"
              : `${growers.length} grower${growers.length > 1 ? "s" : ""} ${searched && query ? `found for “${query}”` : "registered"}`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => download("xlsx")}
            disabled={exporting !== null}
            className="h-9 px-4 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-semibold hover:bg-[#0A3D26] transition-colors inline-flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exporting === "xlsx" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
            Download Excel
          </button>
          <button
            type="button"
            onClick={() => download("pdf")}
            disabled={exporting !== null}
            className="h-9 px-4 rounded-[10px] bg-white border border-[#0B4A2E]/25 text-[#0B4A2E] text-xs font-semibold hover:bg-[#0B4A2E]/5 transition-colors inline-flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exporting === "pdf" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            Download PDF
          </button>
        </div>
      </div>

      {exportError && (
        <div className="mt-3 flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {exportError}
        </div>
      )}

      {/* Results */}
      <div className="mt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#0B4A2E]" />
            <p className="text-xs text-muted">Searching growers…</p>
          </div>
        ) : growers.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No matching growers</p>
            <p className="text-xs text-muted mt-1">
              {query ? `Nothing found for "${query}". Try a different name, membership ID or Aadhaar number.` : "No registered growers yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-[14px] border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#F3F8F4] text-[10px] uppercase tracking-[0.12em] text-muted">
                    <th className="w-12 px-4 py-3 text-center font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Member ID</th>
                    <th className="px-4 py-3 font-semibold">Grower</th>
                    <th className="px-4 py-3 font-semibold">Location</th>
                    <th className="px-4 py-3 text-right font-semibold">Area</th>
                    <th className="px-4 py-3 font-semibold">Variety</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {growers.map((g, i) => {
                    const status = String(g.organicStatus).replaceAll("_", " ").toLowerCase();
                    const variety = String(g.teaVariety).toLowerCase();
                    return (
                      <tr key={g.id} className="hover:bg-[#F7FBF8] transition-colors">
                        <td className="px-4 py-3 text-center text-xs text-muted">{i + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-full border border-[#0B4A2E]/10 bg-[#0B4A2E]/5 px-2 py-0.5 text-[10px] font-semibold text-[#0B4A2E]">
                            {g.membershipId}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-foreground leading-snug">{g.name}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                            <Sprout className="w-3 h-3 shrink-0 text-[#0B4A2E]" />
                            {g.teaGardenName || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-xs text-muted">
                            <MapPin className="w-3 h-3 shrink-0 text-[#0B4A2E]" />
                            {[g.village, g.district].filter(Boolean).join(", ") || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <span className="text-xs font-medium text-foreground">{g.teaArea.toLocaleString("en-IN")} Ha</span>
                          {g.plantationYear ? (
                            <span className="block text-[10px] text-muted">Planted {g.plantationYear}</span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-xs capitalize text-muted">{variety}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                              status === "organic"
                                ? "bg-[#15803d]/10 text-[#15803d]"
                                : "bg-[#d98b34]/10 text-[#a8641c]"
                            }`}
                          >
                            <Users className="w-2.5 h-2.5" />
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
