"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Upload, Download, Trash2, FileText, File, Image, X, Loader2 } from "lucide-react";
import PageShell from "@/components/admin/page-shell";

const categories = ["All", "Aadhaar", "PAN", "Bank", "Land", "Certificates"];

const categoryColors: Record<string, string> = {
  Aadhaar: "bg-blue-100 text-blue-700",
  PAN: "bg-purple-100 text-purple-700",
  Bank: "bg-emerald-100 text-emerald-700",
  Land: "bg-orange-100 text-orange-700",
  Certificates: "bg-pink-100 text-pink-700",
};

const categoryIcons: Record<string, any> = {
  Aadhaar: FileText,
  PAN: FileText,
  Bank: File,
  Land: FileText,
  Certificates: Image,
};

const emptyForm = { title: "", file: "", category: "", size: "", description: "" };

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/documents");
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setDocuments(json.items || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = documents.filter((doc) => {
    const matchCategory = activeCategory === "All" || doc.category === activeCategory;
    const matchSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to add document");
      setToast({ type: "success", text: "Document added." });
      setShowModal(false);
      setForm(emptyForm);
      fetchDocs();
    } catch (e: any) {
      setToast({ type: "error", text: e.message || "Failed to add document." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    try {
      const res = await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setToast({ type: "success", text: "Document deleted." });
      fetchDocs();
    } catch {
      setToast({ type: "error", text: "Failed to delete document." });
    }
  };

  const inputClass = "w-full h-10 px-4 rounded-[10px] bg-gray-50 border border-border text-xs text-foreground outline-none focus:border-[#0B4A2E]/30 transition-all";
  const labelClass = "text-xs font-medium text-foreground block mb-1.5";

  return (
    <PageShell
      title="Document Library"
      description="Upload and manage documents"
      segments={[{ label: "Dashboard", href: "/admin" }, { label: "Documents" }]}
      actions={
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold hover:bg-[#0A3D26] transition-colors">
          <Upload className="w-3.5 h-3.5" /> Upload Document
        </button>
      }
    >
      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-[12px] text-sm ${toast.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {toast.text}
        </div>
      )}

      <div className="bg-white rounded-[12px] border border-border shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-[#0B4A2E] text-white"
                    : "text-muted hover:text-foreground hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 h-9 pl-9 pr-3 rounded-[10px] bg-gray-50 border border-border text-xs outline-none focus:border-[#0B4A2E]/30"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[12px] border border-border shadow-sm p-4 animate-pulse">
                <div className="w-10 h-10 rounded-lg bg-gray-100 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-xs text-muted">{error}</div>
        ) : !filtered.length ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <FileText className="w-10 h-10 text-muted/40 mb-3" />
            <p className="text-sm font-medium text-foreground">No documents uploaded yet</p>
            <p className="text-xs text-muted mt-1">Upload documents to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {filtered.map((doc) => {
              const Icon = categoryIcons[doc.category] || FileText;
              return (
                <div key={doc.id} className="bg-white rounded-[12px] border border-border shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-muted" />
                </div>
                  <p className="text-xs font-medium text-foreground truncate" title={doc.title}>{doc.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 mb-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColors[doc.category] || "bg-gray-100 text-gray-700"}`}>
                      {doc.category || "General"}
                    </span>
                    <span className="text-[10px] text-muted">{doc.size || ""}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <a href={doc.file} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] bg-[#0B4A2E] text-white text-[10px] font-semibold hover:bg-[#0A3D26] transition-colors">
                      <Download className="w-3 h-3" /> Download
                    </a>
                    <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded-[8px] hover:bg-red-50 text-muted hover:text-red-600 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Upload Document</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Title *</label>
                <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category</label>
                  <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select category</option>
                    {["Aadhaar", "PAN", "Bank", "Land", "Certificates"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Size (e.g. 1.2 MB)</label>
                  <input className={inputClass} value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
                </div>
              </div>
              <div>
                <label className={labelClass}>File URL (path in /public or hosted) *</label>
                <input className={inputClass} value={form.file} onChange={(e) => setForm({ ...form, file: e.target.value })} placeholder="/documents/sample.pdf" />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea className={`${inputClass} h-20 pt-2 resize-none`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="h-9 px-4 rounded-[10px] border border-border text-xs font-medium text-muted hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 h-9 px-5 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold hover:bg-[#0A3D26] disabled:opacity-60">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}