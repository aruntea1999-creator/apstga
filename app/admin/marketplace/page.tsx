"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit3, Trash2, Eye, EyeOff, Leaf, Package, X, CheckCircle, AlertCircle, Save, Upload } from "lucide-react";
import PageShell from "@/components/admin/page-shell";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  badge: string | null;
  badgeColor: string;
  image: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  badge: string;
  badgeColor: string;
  imageFile: File | null;
  imagePreview: string;
  active: boolean;
}

const emptyForm: FormState = {
  name: "", description: "", price: "", badge: "", badgeColor: "bg-green-100 text-green-800",
  imageFile: null, imagePreview: "", active: true,
};

const badges = [
  { label: "None", value: "", color: "" },
  { label: "Bestseller", value: "Bestseller", color: "bg-orange-100 text-orange-800" },
  { label: "Organic", value: "Organic", color: "bg-green-100 text-green-800" },
  { label: "Premium", value: "Premium", color: "bg-amber-100 text-amber-800" },
  { label: "New", value: "New", color: "bg-blue-100 text-blue-800" },
  { label: "Limited", value: "Limited", color: "bg-purple-100 text-purple-800" },
];

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/marketplace");
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setProducts(json.products || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  const handleNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setEditingImageUrl("");
    setShowForm(true);
  };

  const handleEdit = (p: Product) => {
    setForm({
      name: p.name, description: p.description, price: p.price,
      badge: p.badge || "", badgeColor: p.badgeColor || "bg-green-100 text-green-800",
      imageFile: null, imagePreview: "", active: p.active,
    });
    setEditingId(p.id);
    setEditingImageUrl(p.image);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm({ ...form, imageFile: file, imagePreview: URL.createObjectURL(file) });
  };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.price) {
      setToast({ type: "error", text: "Name, description and price are required" }); return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("name", form.name);
      fd.set("description", form.description);
      fd.set("price", form.price);
      fd.set("badge", form.badge || "");
      fd.set("badgeColor", form.badge ? badges.find(b => b.value === form.badge)?.color || "" : "");
      fd.set("active", String(form.active));
      if (form.imageFile) {
        fd.set("image", form.imageFile);
      }
      if (editingId) fd.set("id", editingId);

      const res = await fetch("/api/admin/marketplace", {
        method: editingId ? "PUT" : "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("Failed to save");
      setToast({ type: "success", text: editingId ? "Product updated" : "Product created" });
      setShowForm(false);
      fetchProducts();
    } catch { setToast({ type: "error", text: "Failed to save product" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/marketplace?id=${deletingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setToast({ type: "success", text: "Product deleted" });
      setDeletingId(null);
      fetchProducts();
    } catch { setToast({ type: "error", text: "Failed to delete" }); }
  };

  const handleToggleActive = async (p: Product) => {
    try {
      await fetch("/api/admin/marketplace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, active: !p.active }),
      });
      fetchProducts();
    } catch { setToast({ type: "error", text: "Failed to toggle status" }); }
  };

  const previewSrc = form.imagePreview || (editingId ? editingImageUrl : "");

  return (
    <PageShell
      title="Marketplace Management"
      description="Manage tea products displayed in the marketplace"
      segments={[{ label: "Dashboard", href: "/admin" }, { label: "Marketplace" }]}
      actions={
        <button onClick={handleNew} className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold hover:bg-[#0A3D26] transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Product
        </button>
      }
    >
      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-[12px] text-sm flex items-center gap-2 ${
          toast.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.text}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-[14px] shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-foreground">{editingId ? "Edit Product" : "Add Product"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Product Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-10 px-3 rounded-[10px] bg-gray-50 border border-border text-xs outline-none focus:border-[#0B4A2E]/30" placeholder="e.g. Arun Tea — Classic CTC" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full h-20 px-3 py-2 rounded-[10px] bg-gray-50 border border-border text-xs outline-none focus:border-[#0B4A2E]/30 resize-none" placeholder="Product description" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Price</label>
                  <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full h-10 px-3 rounded-[10px] bg-gray-50 border border-border text-xs outline-none focus:border-[#0B4A2E]/30" placeholder="e.g. ₹350 / 250g" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Badge</label>
                  <select value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="w-full h-10 px-3 rounded-[10px] bg-gray-50 border border-border text-xs outline-none focus:border-[#0B4A2E]/30">
                    {badges.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Product Image</label>
                <div className="flex gap-3 items-start">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 h-10 px-3 rounded-[10px] bg-gray-50 border border-border text-xs text-muted hover:border-[#0B4A2E]/30 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{form.imageFile ? form.imageFile.name : "Choose image..."}</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {previewSrc ? (
                    <div className="w-[72px] h-[72px] rounded-[10px] bg-gray-100 overflow-hidden shrink-0 border border-border">
                      <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-[72px] h-[72px] rounded-[10px] bg-gray-50 border border-dashed border-border flex items-center justify-center shrink-0">
                      <Upload className="w-5 h-5 text-muted/40" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 rounded border-border text-[#0B4A2E]" />
                <label htmlFor="active" className="text-xs font-medium text-foreground">Active (visible on marketplace)</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowForm(false)} className="h-9 px-4 rounded-[10px] border border-border text-xs font-medium text-muted hover:text-foreground">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold hover:bg-[#0A3D26] disabled:opacity-60">
                  <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setDeletingId(null)}>
          <div className="bg-white rounded-[14px] shadow-xl p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-medium text-foreground mb-4">Delete this product? This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeletingId(null)} className="px-3 py-1.5 text-xs font-medium rounded-[8px] bg-gray-100 text-muted hover:text-foreground">Cancel</button>
              <button onClick={handleDelete} className="px-3 py-1.5 text-xs font-medium rounded-[8px] bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[12px] border border-border shadow-sm">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-[12px] border border-border p-4 animate-pulse">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : !products.length ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Package className="w-10 h-10 text-muted/40 mb-3" />
            <p className="text-sm font-medium text-foreground">No products yet</p>
            <p className="text-xs text-muted mt-1">Add your first marketplace product.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {products.map((p) => (
              <div key={p.id} className={`rounded-[12px] border p-4 ${p.active ? "border-border shadow-sm" : "border-dashed border-gray-300 bg-gray-50/50"}`}>
                <div className="relative aspect-square bg-[#F0F0ED] rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  <img src={p.image || "/logo/logo.png"} alt={p.name} className="w-full h-full object-cover" />
                  {p.badge && (
                    <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.badgeColor}`}>
                      {p.badge}
                    </div>
                  )}
                  {!p.active && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                      <span className="text-xs font-medium text-muted bg-white px-2 py-1 rounded shadow-sm">Inactive</span>
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-bold text-foreground leading-snug mb-1 truncate">{p.name}</h3>
                <p className="text-xs text-muted mb-2 line-clamp-1">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">{p.price}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleToggleActive(p)} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center" title={p.active ? "Deactivate" : "Activate"}>
                      {p.active ? <Eye className="w-3.5 h-3.5 text-green-600" /> : <EyeOff className="w-3.5 h-3.5 text-muted" />}
                    </button>
                    <button onClick={() => handleEdit(p)} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center"><Edit3 className="w-3.5 h-3.5 text-muted" /></button>
                    <button onClick={() => setDeletingId(p.id)} className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-muted hover:text-red-600" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
