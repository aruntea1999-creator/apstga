"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import PageShell from "@/components/admin/page-shell";
import { DEFAULT_SITE } from "@/lib/use-settings";

const tabs = ["General", "Homepage", "Contact", "Social Media", "SEO"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [general, setGeneral] = useState(DEFAULT_SITE.general);
  const [homepage, setHomepage] = useState(DEFAULT_SITE.hero);
  const [contact, setContact] = useState(DEFAULT_SITE.contact);
  const [social, setSocial] = useState(DEFAULT_SITE.social);
  const [seo, setSeo] = useState({ metaTitle: DEFAULT_SITE.general.metaTitle, metaDescription: DEFAULT_SITE.general.metaDescription });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      if (json.general) setGeneral({ ...DEFAULT_SITE.general, ...json.general });
      if (json.hero) setHomepage({ ...DEFAULT_SITE.hero, ...json.hero });
      if (json.contact) setContact({ ...DEFAULT_SITE.contact, ...json.contact });
      if (json.social) setSocial({ ...DEFAULT_SITE.social, ...json.social });
    } catch {
      setToast({ type: "error", text: "Could not load settings." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ general, hero: homepage, contact, social, seo }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to save");
      setToast({ type: "success", text: "Settings saved successfully." });
    } catch {
      setToast({ type: "error", text: "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full h-10 px-4 rounded-[10px] bg-gray-50 border border-border text-xs text-foreground outline-none focus:border-[#0B4A2E]/30 transition-all";
  const labelClass = "text-xs font-medium text-foreground block mb-1.5";

  const renderTab = () => {
    switch (activeTab) {
      case "General":
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Site Name</label>
              <input className={inputClass} value={general.siteName} onChange={(e) => setGeneral({ ...general, siteName: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Tagline</label>
              <input className={inputClass} value={general.tagline} onChange={(e) => setGeneral({ ...general, tagline: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Registration Number</label>
              <input className={inputClass} value={general.registrationTitle} onChange={(e) => setGeneral({ ...general, registrationTitle: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Footer Text</label>
              <input className={inputClass} value={general.footerText || "© 2026 APSTGA. All rights reserved."}
                onChange={(e) => setGeneral({ ...general, footerText: e.target.value })} />
            </div>
          </div>
        );
      case "Homepage":
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Hero Title</label>
              <textarea className={`${inputClass} h-20 pt-2 resize-none`} value={homepage.title}
                onChange={(e) => setHomepage({ ...homepage, title: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Hero Subtitle</label>
              <textarea className={`${inputClass} h-20 pt-2 resize-none`} value={homepage.subtitle}
                onChange={(e) => setHomepage({ ...homepage, subtitle: e.target.value })} />
            </div>
          </div>
        );
      case "Contact":
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Address</label>
              <textarea className={`${inputClass} h-16 pt-2 resize-none`} value={contact.address}
                onChange={(e) => setContact({ ...contact, address: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input className={inputClass} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
            </div>
          </div>
        );
      case "Social Media":
        return (
          <div className="space-y-4">
            {(["facebook", "twitter", "instagram", "youtube"] as const).map((platform) => (
              <div key={platform}>
                <label className={labelClass}>{platform.charAt(0).toUpperCase() + platform.slice(1)} URL</label>
                <input className={inputClass} value={social[platform]} onChange={(e) => setSocial({ ...social, [platform]: e.target.value })} />
              </div>
            ))}
          </div>
        );
      case "SEO":
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Meta Title</label>
              <input className={inputClass} value={seo.metaTitle} onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Meta Description</label>
              <textarea className={`${inputClass} h-20 pt-2 resize-none`} value={seo.metaDescription}
                onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PageShell
      title="Website Settings"
      description="Manage your website configuration"
      segments={[{ label: "Dashboard", href: "/admin" }, { label: "Settings" }]}
    >
      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-[12px] text-sm flex items-center gap-2 ${
          toast.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.text}
        </div>
      )}

      <div className="bg-white rounded-[12px] border border-border shadow-sm">
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-xs font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? "text-[#0B4A2E] border-[#0B4A2E]"
                  : "text-muted border-transparent hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-5">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="h-3 bg-gray-100 rounded w-20 mb-1.5" />
                  <div className="h-10 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {renderTab()}
              <div className="mt-6 pt-4 border-t border-border">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 h-9 px-5 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold hover:bg-[#0A3D26] disabled:opacity-60 transition-colors"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}