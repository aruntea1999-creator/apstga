"use client";

// Client wrapper that connects the idcard kit to this website.
// Replaces the old server-rendered IdCardGenerator: data loads from
// /api/admin/growers/[id], contact details from Website Settings, and the
// generated PDF is stored through /api/admin/growers/[id]/id-card/save.

import { useCallback, useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import IdCardPanel from "@/components/idcard/IdCardPanel";
import { toCardData } from "@/lib/idcard-data";
import { DEFAULT_CONTACT, type CardContact, type GrowerCardData } from "@/lib/idcard";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://apstga.org";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

async function loadContact(): Promise<CardContact> {
  try {
    const res = await fetch("/api/settings");
    if (!res.ok) return DEFAULT_CONTACT;
    const s = await res.json();
    const address = String(s?.contact?.address ?? "").trim();
    const location = /itanagar/i.test(address)
      ? "Itanagar, Arunachal Pradesh"
      : address.replace(/\s*\b\d{6}\b\s*$/, "").trim() || DEFAULT_CONTACT.location;
    return {
      phone: String(s?.contact?.phone ?? "").trim() || DEFAULT_CONTACT.phone,
      email: String(s?.contact?.email ?? "").trim() || DEFAULT_CONTACT.email,
      location,
    };
  } catch {
    return DEFAULT_CONTACT;
  }
}

export default function IdCardSection({ growerId }: { growerId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardData, setCardData] = useState<GrowerCardData | null>(null);
  const [approved, setApproved] = useState(false);
  const [contact, setContact] = useState<CardContact>(DEFAULT_CONTACT);
  const [latest, setLatest] = useState<{ url: string; name: string } | null>(null);

  const loadLatest = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/growers/${growerId}/id-card/save`);
      if (!res.ok) return;
      const json = await res.json();
      const pdf = Array.isArray(json.files)
        ? json.files.find((f: { name: string }) => f.name.endsWith(".pdf"))
        : null;
      if (pdf) setLatest({ url: pdf.url, name: pdf.name });
    } catch {
      /* optional */
    }
  }, [growerId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [growerRes] = await Promise.all([
        fetch(`/api/admin/growers/${growerId}`),
        loadContact().then(setContact),
      ]);
      if (!growerRes.ok) throw new Error("Failed to load member data");
      const json = await growerRes.json();
      if (json.error) throw new Error(json.error);
      setCardData(toCardData(growerId, json));
      setApproved(json.status === "APPROVED");
      await loadLatest();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load member data");
    } finally {
      setLoading(false);
    }
  }, [growerId, loadLatest]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  const onGenerated = useCallback(
    async (pdf: Blob) => {
      const dataUrl = await blobToDataUrl(pdf);
      const res = await fetch(`/api/admin/growers/${growerId}/id-card/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdf: dataUrl }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to save the generated card");
      const saved = Array.isArray(json.files)
        ? json.files.find((f: { name: string }) => f.name.endsWith(".pdf"))
        : null;
      if (saved) setLatest({ url: saved.url, name: saved.name });
      return saved ? { url: saved.url, name: saved.name } : undefined;
    },
    [growerId]
  );

  if (loading) {
    return (
      <div className="bg-white rounded-[12px] border border-border shadow-sm p-5">
        <div className="py-16 flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#0B4A2E]" />
          <p className="text-xs text-muted">Loading member details…</p>
        </div>
      </div>
    );
  }

  if (error || !cardData) {
    return (
      <div className="bg-white rounded-[12px] border border-border shadow-sm p-5">
        <div className="flex items-start gap-2 text-xs font-bold text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-[1px]" />
          <span>{error || "Member data could not be loaded"}</span>
        </div>
      </div>
    );
  }

  return (
    <IdCardPanel
      grower={cardData}
      siteUrl={SITE_URL}
      approved={approved}
      contact={contact}
      latestPdfUrl={latest?.url}
      latestPdfName={latest?.name}
      onGenerated={onGenerated}
    />
  );
}
