"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, CalendarDays, MapPin, Tag, Trash2, X, Loader2 } from "lucide-react";
import PageShell from "@/components/admin/page-shell";

const emptyForm = { title: "", date: "", location: "", category: "", description: "" };

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/events");
      if (!res.ok) throw new Error("Failed to load events");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setEvents(json.events || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to create event");
      setToast({ type: "success", text: "Event created." });
      setShowModal(false);
      setForm(emptyForm);
      fetchEvents();
    } catch (e: any) {
      setToast({ type: "error", text: e.message || "Failed to create event." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setToast({ type: "success", text: "Event deleted." });
      fetchEvents();
    } catch {
      setToast({ type: "error", text: "Failed to delete event." });
    }
  };

  const inputClass = "w-full h-10 px-4 rounded-[10px] bg-gray-50 border border-border text-xs text-foreground outline-none focus:border-[#0B4A2E]/30 transition-all";
  const labelClass = "text-xs font-medium text-foreground block mb-1.5";

  return (
    <PageShell
      title="Events"
      description="Manage upcoming events"
      segments={[{ label: "Dashboard", href: "/admin" }, { label: "Events" }]}
      actions={
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold hover:bg-[#0A3D26] transition-colors">
          <Plus className="w-3.5 h-3.5" /> Create Event
        </button>
      }
    >
      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-[12px] text-sm ${toast.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {toast.text}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[12px] border border-border shadow-sm p-5 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
              <div className="h-5 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-[12px] border border-border shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-foreground">{error}</p>
          <button onClick={fetchEvents} className="mt-3 text-xs font-medium text-[#0B4A2E] hover:underline">Retry</button>
        </div>
      ) : !events.length ? (
        <div className="bg-white rounded-[12px] border border-border shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <CalendarDays className="w-10 h-10 text-muted/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No events scheduled</p>
          <p className="text-xs text-muted mt-1">Create your first event to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div key={event.id} className="group bg-white rounded-[12px] border border-border shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-foreground">{event.title}</h3>
                <button onClick={() => handleDelete(event.id)} className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full hover:bg-red-50 text-muted hover:text-red-600 flex items-center justify-center shrink-0 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {event.description && <p className="text-[11px] text-muted mt-1.5 line-clamp-2">{event.description}</p>}
              <div className="space-y-2 my-4">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                  <span>{new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-xs text-muted">
                  <MapPin className="w-3.5 h-3.5 shrink-0" /> <span>{event.location}</span></div>
                )}
              </div>
              {event.category && (
                <div className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-muted" />
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{event.category}</span></div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40" onClick={() => setShowModal(false)} />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Create Event</h3>
            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-muted"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className={labelClass}>Title *</label>
              <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Date *</label>
                <input type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Meeting / Training" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea className={`${inputClass} h-24 pt-2 resize-none`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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