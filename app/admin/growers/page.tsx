"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Plus, Eye, Trash2, ChevronLeft, ChevronRight, User, X, Loader2, Download } from "lucide-react";
import PageShell from "@/components/admin/page-shell";
import SkeletonTable from "@/components/admin/skeleton-table";

const statusStyles: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-orange-100 text-orange-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function GrowersPage() {
  return (
    <Suspense
      fallback={
        <PageShell
          title="Growers Management"
          description="View and manage all registered tea growers"
          segments={[{ label: "Dashboard", href: "/admin" }, { label: "Growers" }]}
        >
          <div className="p-4"><SkeletonTable rows={8} cols={7} /></div>
        </PageShell>
      }
    >
      <GrowersContent />
    </Suspense>
  );
}

function GrowersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [districts, setDistricts] = useState<any[]>([]);
  const [downloadDistrict, setDownloadDistrict] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [form, setForm] = useState({
    name: "", fatherName: "", gender: "Male", dob: "", mobile: "", email: "",
    districtId: "", villageId: "", circle: "", address: "",
    aadhaar: "", pan: "", photo: "", teaGardenName: "", teaArea: "", plantationYear: "", annualProduction: "",
    organicStatus: "CONVENTIONAL", teaVariety: "MIXED",
    latitude: "", longitude: "", bankName: "", accountNumber: "", ifscCode: "",
  });
  const limit = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (searchTerm) params.set("search", searchTerm);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/dashboard?${params}`);
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setRows(json.recentRegistrations?.rows || []);
      setTotal(json.recentRegistrations?.total || 0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== searchTerm) {
      setSearchTerm(q);
      setPage(1);
    }
  }, [searchParams]);

  const filtered = searchTerm
    ? rows.filter((r) =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone?.includes(searchTerm)
      )
    : rows;

  const totalPages = Math.ceil(total / limit);

  const openAddModal = async () => {
    setShowAddModal(true);
    try {
      const res = await fetch("/api/admin/districts");
      if (res.ok) setDistricts(await res.json());
    } catch {}
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddGrower = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/growers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create grower");
      setShowAddModal(false);
      setForm({
        name: "", fatherName: "", gender: "Male", dob: "", mobile: "", email: "",
        districtId: "", villageId: "", circle: "", address: "",
        aadhaar: "", pan: "", photo: "", teaGardenName: "", teaArea: "", plantationYear: "", annualProduction: "",
        organicStatus: "CONVENTIONAL", teaVariety: "MIXED",
        latitude: "", longitude: "", bankName: "", accountNumber: "", ifscCode: "",
      });
      fetchData();
    } catch {
      alert("Failed to create grower. Please check all fields.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDistrict = districts.find((d) => d.id === form.districtId);

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams({ format: "xlsx" });
      if (downloadDistrict) params.set("district", downloadDistrict);
      const res = await fetch(`/api/growers/export?${params}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `apstga-growers-${downloadDistrict || "all"}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download Excel file");
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/growers/${deleteTarget}`, { method: "DELETE" });
      setDeleteTarget(null);
      fetchData();
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageShell
      title="Growers Management"
      description="View and manage all registered tea growers"
      segments={[{ label: "Dashboard", href: "/admin" }, { label: "Growers" }]}
      actions={
        <button onClick={openAddModal} className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold hover:bg-[#0A3D26] transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Grower
        </button>
      }
    >
      <div className="bg-white rounded-[12px] border border-border shadow-sm flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <input
              type="text"
              placeholder="Search by name or mobile..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
                const params = new URLSearchParams(searchParams.toString());
                if (e.target.value) params.set("q", e.target.value);
                else params.delete("q");
                router.replace(`/admin/growers?${params.toString()}`, { scroll: false });
              }}
              className="w-64 h-9 pl-9 pr-3 rounded-[10px] bg-gray-50 border border-border text-xs outline-none focus:border-[#0B4A2E]/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-9 px-3 rounded-[10px] bg-gray-50 border border-border text-xs text-muted outline-none focus:border-[#0B4A2E]/30"
          >
            <option value="">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
          {districts.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={downloadDistrict}
                onChange={(e) => setDownloadDistrict(e.target.value)}
                className="h-9 px-3 rounded-[10px] bg-gray-50 border border-border text-xs text-muted outline-none focus:border-[#0B4A2E]/30"
              >
                <option value="">Export: All Districts</option>
                {districts.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <button
                onClick={handleDownloadExcel}
                disabled={downloading}
                className="flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold disabled:opacity-50 hover:bg-[#0A3D26] transition-colors"
              >
                {downloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {downloading ? "Exporting..." : "Export Excel"}
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-4"><SkeletonTable rows={8} cols={7} /></div>
        ) : error ? (
          <div className="p-12 text-xs text-center text-muted">{error}</div>
        ) : !filtered.length ? (
          <div className="p-12 text-xs text-center text-muted">No growers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  {["Name", "District", "Village", "Phone", "Status", "Registered Date", "Actions"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-muted px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r: any, i: number) => (
                  <tr key={r.id || i} className="border-b border-border hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-xs font-medium text-foreground">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{r.district}</td>
                    <td className="px-4 py-3 text-xs text-muted">{r.village}</td>
                    <td className="px-4 py-3 text-xs text-muted">{r.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusStyles[r.status] || ""}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{r.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/growers/${r.id}`}
                          className="w-7 h-7 rounded-full hover:bg-gray-100 text-muted hover:text-foreground flex items-center justify-center"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(r.id)}
                          className="w-7 h-7 rounded-full hover:bg-red-50 text-muted hover:text-red-600 flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-[11px] text-muted">Showing {Math.min((page - 1) * limit + 1, total)}-{Math.min(page * limit, total)} of {total}</span>
            <div className="flex items-center gap-1">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted disabled:opacity-30">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 py-1 text-xs font-bold text-foreground">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted disabled:opacity-30">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-[14px] shadow-xl p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-medium text-foreground mb-4">Are you sure you want to delete this grower? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="px-3 py-1.5 text-xs font-medium rounded-[8px] bg-gray-100 text-muted hover:text-foreground">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-3 py-1.5 text-xs font-medium rounded-[8px] bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-10 pb-10 overflow-y-auto" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-[14px] shadow-xl w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold text-foreground">Add New Grower</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-muted hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddGrower} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Personal Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Full Name *</label>
                    <input name="name" value={form.name} onChange={handleFormChange} required className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Father's Name *</label>
                    <input name="fatherName" value={form.fatherName} onChange={handleFormChange} required className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Gender *</label>
                    <select name="gender" value={form.gender} onChange={handleFormChange} className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Date of Birth *</label>
                    <input type="date" name="dob" value={form.dob} onChange={handleFormChange} required className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Mobile *</label>
                    <input name="mobile" value={form.mobile} onChange={handleFormChange} required className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleFormChange} className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Location</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">District *</label>
                    <select name="districtId" value={form.districtId} onChange={handleFormChange} required className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30">
                      <option value="">Select District</option>
                      {districts.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Village *</label>
                    <select name="villageId" value={form.villageId} onChange={handleFormChange} required className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30">
                      <option value="">Select Village</option>
                      {selectedDistrict?.villages?.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Circle</label>
                    <input name="circle" value={form.circle} onChange={handleFormChange} className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-foreground block mb-1">Address *</label>
                    <textarea name="address" value={form.address} onChange={handleFormChange} required rows={2} className="w-full px-3 py-2 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30 resize-none" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Identification</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Aadhaar Number *</label>
                    <input name="aadhaar" value={form.aadhaar} onChange={handleFormChange} required className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">PAN Number</label>
                    <input name="pan" value={form.pan} onChange={handleFormChange} className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Photo URL</label>
                    <input name="photo" value={form.photo} onChange={handleFormChange} placeholder="https://…/photo.jpg (optional)" className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Tea Garden Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Garden Name *</label>
                    <input name="teaGardenName" value={form.teaGardenName} onChange={handleFormChange} required className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Tea Area (Ha) *</label>
                    <input type="number" step="0.01" name="teaArea" value={form.teaArea} onChange={handleFormChange} required className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Annual Production (Kg)</label>
                    <input type="number" step="0.01" name="annualProduction" value={form.annualProduction} onChange={handleFormChange} className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Plantation Year</label>
                    <input type="number" min="1950" max="2100" name="plantationYear" value={form.plantationYear} onChange={handleFormChange} className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Organic Status</label>
                    <select name="organicStatus" value={form.organicStatus} onChange={handleFormChange} className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30">
                      <option value="ORGANIC">Organic</option>
                      <option value="CONVENTIONAL">Conventional</option>
                      <option value="IN_TRANSITION">In Transition</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Tea Variety</label>
                    <select name="teaVariety" value={form.teaVariety} onChange={handleFormChange} className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30">
                      <option value="ASSAM">Assam</option>
                      <option value="CHINESE">Chinese</option>
                      <option value="CLONAL">Clonal</option>
                      <option value="MIXED">Mixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Latitude</label>
                    <input type="number" step="any" name="latitude" value={form.latitude} onChange={handleFormChange} className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Longitude</label>
                    <input type="number" step="any" name="longitude" value={form.longitude} onChange={handleFormChange} className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Bank Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Bank Name</label>
                    <input name="bankName" value={form.bankName} onChange={handleFormChange} className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Account Number</label>
                    <input name="accountNumber" value={form.accountNumber} onChange={handleFormChange} className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">IFSC Code</label>
                    <input name="ifscCode" value={form.ifscCode} onChange={handleFormChange} className="w-full h-9 px-3 rounded-[10px] border border-border text-xs outline-none focus:border-[#0B4A2E]/30" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <button type="button" onClick={() => setShowAddModal(false)} className="h-9 px-4 rounded-[10px] border border-border text-xs font-medium text-muted hover:text-foreground">Cancel</button>
                <button type="submit" disabled={submitting} className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold hover:bg-[#0A3D26] disabled:opacity-50">
                  {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  {submitting ? "Saving..." : "Save Grower"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
