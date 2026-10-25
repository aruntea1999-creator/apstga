"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit3, Trash2, Newspaper, X, Loader2 } from "lucide-react";
import PageShell from "@/components/admin/page-shell";
import SkeletonTable from "@/components/admin/skeleton-table";

const emptyForm = { title: "", slug: "", excerpt: "", content: "", category: "", published: false };

export default function NewsPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/news");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setArticles(json.items || []);
    } catch {
      setToast({ type: "error", text: "Failed to load articles." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (a: any) => {
    setEditingId(a.id);
    setForm({ title: a.title, slug: a.slug, excerpt: a.excerpt || "", content: a.content, category: a.category || "", published: a.published });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      const url = editingId ? `/api/admin/news/${editingId}` : "/api/admin/news";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to save");
      setToast({ type: "success", text: editingId ? "Article updated." : "Article created." });
      setShowModal(false);
      fetchArticles();
    } catch (e: any) {
      setToast({ type: "error", text: e.message || "Failed to save article." });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (a: any) => {
    try {
      const res = await fetch(`/api/admin/news/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !a.published }),
      });
      if (!res.ok) throw new Error();
      fetchArticles();
    } catch {
      setToast({ type: "error", text: "Failed to update status." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setToast({ type: "success", text: "Article deleted." });
      fetchArticles();
    } catch {
      setToast({ type: "error", text: "Failed to delete article." });
    }
  };

  const inputClass = "w-full h-10 px-4 rounded-[10px] bg-gray-50 border border-border text-xs text-foreground outline-none focus:border-[#0B4A2E]/30 transition-all";
  const labelClass = "text-xs font-medium text-foreground block mb-1.5";

  return (
    <PageShell
      title="News & Events"
      description="Manage articles and announcements"
      segments={[{ label: "Dashboard", href: "/admin" }, { label: "News" }]}
      actions={
        <button onClick={openCreate} className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold hover:bg-[#0A3D26] transition-colors">
          <Plus className="w-3.5 h-3.5" /> Create Article
        </button>
      }
    >
      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-[12px] text-sm flex items-center gap-2 ${
          toast.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {toast.text}
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : !articles.length ? (
        <div className="bg-white rounded-[12px] border border-border shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <Newspaper className="w-10 h-10 text-muted/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No articles yet</p>
          <p className="text-xs text-muted mt-1">Create your first news article or announcement.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[12px] border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  {["Title", "Excerpt", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-muted px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b border-border hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-xs font-medium text-foreground">{article.title}</div>
                        {article.category && <div className="text-[10px] text-muted mt-0.5">{article.category}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted max-w-xs truncate">{article.excerpt || "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublish(article)}
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          article.published ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {article.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {new Date(article.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(article)} className="w-7 h-7 rounded-full hover:bg-gray-100 text-muted hover:text-foreground flex items-center justify-center">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(article.id)} className="w-7 h-7 rounded-full hover:bg-red-50 text-muted hover:text-red-600 flex items-center justify-center">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-[16px] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">{editingId ? "Edit Article" : "Create Article"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Title *</label>
                  <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Slug (optional)</label>
                  <input className={inputClass} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Excerpt</label>
                <textarea className={`${inputClass} h-20 pt-2 resize-none`} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Content *</label>
                <textarea className={`${inputClass} h-40 pt-2 resize-none`} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 text-xs text-muted">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 rounded border-border" />
                Publish immediately (visible on the public site)
              </label>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="h-9 px-4 rounded-[10px] border border-border text-xs font-medium text-muted hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 h-9 px-5 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold hover:bg-[#0A3D26] disabled:opacity-60">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}