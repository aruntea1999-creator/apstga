"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Link2, ExternalLink, Loader2, Eye, EyeOff } from "lucide-react";
import PageShell from "@/components/admin/page-shell";

interface WorkItem {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  published: boolean;
}

export default function OurWorkPage() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/our-work");
      if (!res.ok) throw new Error("Failed to load works");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setItems(json.items || []);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load works");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchItems, 0);
    return () => clearTimeout(t);
  }, [fetchItems]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleAdd = async () => {
    if (!link.trim()) return;
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/our-work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to add link");
      setToast({ type: "success", text: "Work added with link preview." });
      setLink("");
      fetchItems();
    } catch (e: unknown) {
      setToast({ type: "error", text: e instanceof Error ? e.message : "Failed to add link." });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (item: WorkItem) => {
    try {
      const res = await fetch(`/api/admin/our-work/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !item.published }),
      });
      if (!res.ok) throw new Error();
      fetchItems();
    } catch {
      setToast({ type: "error", text: "Failed to update visibility." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this work? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/our-work/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setToast({ type: "success", text: "Work deleted." });
      fetchItems();
    } catch {
      setToast({ type: "error", text: "Failed to delete work." });
    }
  };

  const inputClass = "w-full h-10 px-4 rounded-[10px] bg-gray-50 border border-border text-xs text-foreground outline-none focus:border-[#0B4A2E]/30 transition-all";

  return (
    <PageShell
      title="Our Work"
      description="Share posts your organization has done by pasting social media links. A preview is fetched from each link automatically."
      segments={[{ label: "Dashboard", href: "/admin" }, { label: "Our Work" }]}
    >
      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-[12px] text-sm ${toast.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {toast.text}
        </div>
      )}

      <div className="bg-white rounded-[12px] border border-border shadow-sm p-5 mb-6">
        <label className="text-xs font-medium text-foreground block mb-1.5">Paste a social media post link</label>
        <div className="flex gap-2">
          <input
            className={inputClass}
            placeholder="https://facebook.com/... / https://youtube.com/watch?v=..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          />
          <button onClick={handleAdd} disabled={saving || !link.trim()}
            className="flex items-center gap-1.5 h-10 px-5 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold hover:bg-[#0A3D26] disabled:opacity-60 shrink-0">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add Work
          </button>
        </div>
        <p className="text-[11px] text-muted mt-2">Tip: The title, description, and thumbnail are fetched automatically from the link (Open Graph).</p>
      </div>

      {loading ? (
        <div className="flex flex-wrap gap-[38px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-[240px] bg-white rounded-[20px] border border-border shadow-[0_2px_12px_rgba(16,24,40,0.06)] p-4 animate-pulse">
              <div className="h-40 bg-gray-100 rounded-xl mb-3" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3.5 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-3.5 bg-gray-100 rounded w-2/3 mb-3" />
              <div className="h-8 bg-gray-100 rounded-full w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-[20px] border border-border shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-foreground">{error}</p>
          <button onClick={fetchItems} className="mt-3 text-xs font-medium text-[#0B4A2E] hover:underline">Retry</button>
        </div>
      ) : !items.length ? (
        <div className="bg-white rounded-[20px] border border-border shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <Link2 className="w-10 h-10 text-muted/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No work shared yet</p>
          <p className="text-xs text-muted mt-1">Paste a link above to share your first piece of work.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-[38px]">
          {items.map((item) => (
            <div key={item.id} className="group flex flex-col w-[240px]">
              <div className="w-full aspect-square bg-white rounded-[20px] border border-border shadow-[0_2px_12px_rgba(16,24,40,0.06)] overflow-hidden hover:shadow-[0_16px_40px_rgba(16,24,40,0.14)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="relative h-[55%] min-h-[120px] shrink-0 bg-gray-100 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Link2 className="w-6 h-6 text-muted/40" />
                  </div>
                  {item.image && (
                    <img
                      src={`/api/our-work/image?id=${item.id}`}
                      alt={item.title || "Work preview"}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute top-2 left-2 text-[8px] font-semibold text-white bg-[#0B4A2E]/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ExternalLink className="w-2.5 h-2.5" /> {new URL(item.url).hostname}
                  </span>
                  <span className={`absolute top-2 right-2 text-[8px] font-bold px-2 py-0.5 rounded-full ${item.published ? "bg-emerald-500 text-white" : "bg-gray-500 text-white opacity-70"}`}>
                    {item.published ? "Visible" : "Hidden"}
                  </span>
                </div>
                <div className="relative z-10 flex-1 min-h-0 p-2.5 flex flex-col gap-1 overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[11px] font-bold text-foreground leading-snug line-clamp-2">{item.title || "Untitled link"}</h3>
                    <button onClick={() => handleDelete(item.id)} title="Delete"
                      className="w-6 h-6 rounded-full hover:bg-red-50 text-muted hover:text-red-600 flex items-center justify-center shrink-0 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  {item.description && <p className="text-[10px] text-muted leading-relaxed line-clamp-3">{item.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-[19px]">
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1 h-8 rounded-full border border-border text-[#0B4A2E] text-[10px] font-bold hover:bg-gray-50 transition-colors">
                  <ExternalLink className="w-3 h-3" /> Open Original Post
                </a>
                <button onClick={() => togglePublish(item)} title={item.published ? "Hide from website" : "Show on website"}
                  className="h-8 px-2.5 rounded-full border border-border text-muted hover:text-[#0B4A2E] hover:bg-gray-50 flex items-center justify-center gap-1 text-[10px] font-bold shrink-0 transition-colors">
                  {item.published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {item.published ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}