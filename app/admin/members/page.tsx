"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Trash2, Loader2, ImagePlus, UsersRound, X } from "lucide-react";
import PageShell from "@/components/admin/page-shell";

interface Member {
  id: string;
  name: string;
  designation: string;
  sortOrder: number;
  active: boolean;
  hasPhoto: boolean;
  photoUrl: string | null;
}

export default function ExecutiveMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/members");
      if (!res.ok) throw new Error("Failed to load members");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setMembers(json.members || []);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchMembers, 0);
    return () => clearTimeout(t);
  }, [fetchMembers]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const url = previewUrl;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [previewUrl]);

  const setSelectedPhoto = (file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhoto(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
    if (!file && fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setName("");
    setDesignation("");
    setSortOrder("0");
    setSelectedPhoto(null);
  };

  const handleAdd = async () => {
    if (!name.trim() || !designation.trim()) {
      setToast({ type: "error", text: "Name and designation are required." });
      return;
    }
    if (!photo) {
      setToast({ type: "error", text: "Please choose a photo for this member." });
      return;
    }

    setSaving(true);
    setToast(null);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("designation", designation.trim());
      fd.append("sortOrder", sortOrder || "0");
      fd.append("photo", photo);

      const res = await fetch("/api/admin/members", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to add member");

      setToast({ type: "success", text: `${name.trim()} added to Our Members.` });
      resetForm();
      fetchMembers();
    } catch (e: unknown) {
      setToast({ type: "error", text: e instanceof Error ? e.message : "Failed to add member." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: Member) => {
    if (!confirm(`Delete ${member.name}? This will remove the member from the website.`)) return;
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setToast({ type: "success", text: `${member.name} removed.` });
      fetchMembers();
    } catch {
      setToast({ type: "error", text: "Failed to delete member." });
    }
  };

  const inputClass =
    "w-full h-10 px-4 rounded-[10px] bg-gray-50 border border-border text-xs text-foreground outline-none focus:border-[#0B4A2E]/30 transition-all";
  const labelClass = "text-xs font-medium text-foreground block mb-1.5";

  return (
    <PageShell
      title="Executive Members"
      description="Add or remove executive members. They appear with their photo and designation in the Our Members section of the website."
      segments={[{ label: "Dashboard", href: "/admin" }, { label: "Executive Members" }]}
    >
      {toast && (
        <div
          className={`mb-4 px-4 py-3 rounded-[12px] text-sm ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* Add member */}
      <div className="bg-white rounded-[12px] border border-border shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <UsersRound className="w-4 h-4 text-[#0B4A2E]" />
          <h2 className="text-sm font-bold text-foreground">Add Executive Member</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arjun Baruah"
            />
          </div>
          <div>
            <label className={labelClass}>Designation</label>
            <input
              className={inputClass}
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. President"
            />
          </div>
          <div>
            <label className={labelClass}>Display Order</label>
            <input
              type="number"
              className={inputClass}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className={labelClass}>Photo</label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => setSelectedPhoto(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] border border-[#0B4A2E]/20 bg-white text-[#0B4A2E] text-xs font-semibold hover:bg-[#0B4A2E]/5 transition-colors"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                {photo ? "Change Photo" : "Choose Photo"}
              </button>

              {previewUrl ? (
                <div className="relative h-14 w-12 overflow-hidden rounded-lg border border-border bg-gray-50">
                  <img src={previewUrl} alt="Selected member photo" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(null)}
                    className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    aria-label="Remove selected photo"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-muted">JPG, PNG or WebP · max 5 MB</span>
              )}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={saving}
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold hover:bg-[#0A3D26] disabled:opacity-60 transition-colors ml-auto"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            {saving ? "Adding..." : "Add Member"}
          </button>
        </div>
      </div>

      {/* Members list */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[16px] border border-border shadow-sm overflow-hidden animate-pulse">
              <div className="aspect-[4/5] bg-gray-100" />
              <div className="p-3.5">
                <div className="h-3.5 bg-gray-100 rounded w-3/4 mx-auto mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-[16px] border border-border shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-foreground">{error}</p>
          <button onClick={fetchMembers} className="mt-3 text-xs font-medium text-[#0B4A2E] hover:underline">
            Retry
          </button>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-[16px] border border-border shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <UsersRound className="w-10 h-10 text-muted/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No executive members yet</p>
          <p className="text-xs text-muted mt-1">Add a member above to display them on the Our Members page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {members.map((member) => (
            <div
              key={member.id}
              className="group bg-white rounded-[16px] border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[4/5] bg-[#f3f8f4]">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UsersRound className="w-8 h-8 text-[#0B4A2E]/25" />
                  </div>
                )}

                <span className="absolute left-2 top-2 rounded-full bg-[#0B4A2E]/85 px-2 py-0.5 text-[9px] font-bold text-white">
                  #{member.sortOrder}
                </span>

                <button
                  onClick={() => handleDelete(member)}
                  title={`Delete ${member.name}`}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-600 shadow-md ring-1 ring-black/5 transition-colors hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3.5 text-center">
                <h3 className="text-sm font-bold leading-snug text-foreground">{member.name}</h3>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#15803d]">
                  {member.designation}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
