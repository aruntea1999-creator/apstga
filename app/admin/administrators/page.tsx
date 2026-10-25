"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit3, ShieldAlert, User, Shield, Trash2, X, Loader2 } from "lucide-react";
import PageShell from "@/components/admin/page-shell";
import SkeletonTable from "@/components/admin/skeleton-table";

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700",
  DISTRICT_ADMIN: "bg-blue-100 text-blue-700",
  OPERATOR: "bg-green-100 text-green-700",
  VIEWER: "bg-gray-100 text-gray-700",
};

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  DISTRICT_ADMIN: "District Admin",
  OPERATOR: "Operator",
  VIEWER: "Viewer",
};

const emptyForm = { name: "", email: "", role: "VIEWER", active: true, password: "", district: "" };

export default function AdministratorsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/administrators");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setAdmins(json.users || []);
    } catch {
      setToast({ type: "error", text: "Failed to load administrators." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);
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
    setForm({ name: a.name || "", email: a.email || "", role: a.role || "VIEWER", active: a.active, password: "", district: a.district || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      const url = editingId ? `/api/admin/administrators/${editingId}` : "/api/admin/administrators";
      const body: any = { name: form.name, role: form.role, active: form.active, district: form.district };
      if (!editingId) body.email = form.email;
      if (form.password) body.password = form.password;
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to save");
      setToast({ type: "success", text: editingId ? "Administrator updated." : "Administrator added." });
      setShowModal(false);
      fetchAdmins();
    } catch (e: any) {
      setToast({ type: "error", text: e.message || "Failed to save administrator." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this administrator?")) return;
    try {
      const res = await fetch(`/api/admin/administrators/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setToast({ type: "success", text: "Administrator deleted." });
      fetchAdmins();
    } catch {
      setToast({ type: "error", text: "Failed to delete administrator." });
    }
  };

  const toggleActive = async (a: any) => {
    try {
      const res = await fetch(`/api/admin/administrators/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !a.active }),
      });
      if (!res.ok) throw new Error();
      fetchAdmins();
    } catch {
      setToast({ type: "error", text: "Failed to update status." });
    }
  };

  const inputClass = "w-full h-10 px-4 rounded-[10px] bg-gray-50 border border-border text-xs text-foreground outline-none focus:border-[#0B4A2E]/30 transition-all";
  const labelClass = "text-xs font-medium text-foreground block mb-1.5";

  return (
    <PageShell
      title="Administrators"
      description="Manage admin users"
      segments={[{ label: "Dashboard", href: "/admin" }, { label: "Administrators" }]}
      actions={
        <button onClick={openCreate} className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold hover:bg-[#0A3D26] transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Admin
        </button>
      }
    >
      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-[12px] text-sm ${toast.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {toast.text}
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : !admins.length ? (
        <div className="bg-white rounded-[12px] border border-border shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <ShieldAlert className="w-10 h-10 text-muted/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No administrators found</p>
          <p className="text-xs text-muted mt-1">Add an administrator to manage the platform.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[12px] border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  {["Name", "Email", "Role", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-muted px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-border hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{admin.name}</span>
                  </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{admin.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${roleColors[admin.role] || "bg-gray-100 text-gray-700"}`}>
                      {roleLabels[admin.role] || admin.role}
                    </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(admin)}
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${admin.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {admin.active ? "Active" : "Inactive"}
                    </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(admin)} className="w-7 h-7 rounded-full hover:bg-gray-100 text-muted hover:text-foreground flex items-center justify-center">
                        <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(admin.id)} className="w-7 h-7 rounded-full hover:bg-red-50 text-muted hover:text-red-600 flex items-center justify-center">
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
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">{editingId ? "Edit Administrator" : "Add Administrator"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              {editingId === null && (
                <div>
                  <label className={labelClass}>Email *</label>
                  <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              )}
              <div>
                <label className={labelClass}>Name *</label>
                <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Password {editingId ? "(leave blank to keep current)" : "* (min 6 characters)"}</label>
                <input type="password" className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              {editingId === null && (
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 rounded border-border" />
                  Active (allowed to sign in)
                </label>
              )}
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