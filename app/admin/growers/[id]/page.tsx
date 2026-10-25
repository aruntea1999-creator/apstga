"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Eye,
  EyeOff,
  Copy,
  Loader2,
} from "lucide-react";
import PageShell from "@/components/admin/page-shell";
import IdCardSection from "@/components/idcard/id-card-section";

interface GrowerDetail {
  id: string;
  membershipId: string;
  name: string;
  fatherName?: string;
  mobile: string;
  email?: string;
  status: string;
  registeredAt: string;
  approvedAt?: string;
  district?: { id: string; name: string };
  village?: { id: string; name: string };
  address?: string;
  teaGardenName?: string;
  teaArea?: number;
  plantationYear?: number;
  annualProduction?: number;
  organicStatus?: string;
  teaVariety?: string;
  documents?: any;
  payments?: any[];
}

interface SensitiveData {
  aadhaar: string | null;
  pan: string | null;
}

function maskAadhaar(v: string | null | undefined): string {
  if (!v) return "";
  const digits = v.replace(/\D/g, "");
  if (digits.length < 4) return v;
  return `XXXX XXXX ${digits.slice(-4)}`;
}

function maskPan(v: string | null | undefined): string {
  if (!v) return "";
  const trimmed = v.trim();
  if (trimmed.length < 4) return trimmed;
  return "X".repeat(trimmed.length - 4) + trimmed.slice(-4);
}

function formatDateIN(d: string | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function membershipExpiryDate(approvedAt: string | undefined, registeredAt: string | undefined): string {
  const base = approvedAt ?? registeredAt;
  if (!base) return "";
  const d = new Date(base);
  const year = d.getUTCFullYear() + 4;
  return `31 Dec ${year}`;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  const isEmpty = value == null || String(value).trim() === "";
  return (
    <div className="space-y-1">
      <span className="text-[13px] text-muted block uppercase tracking-wider">{label}</span>
      <span className="text-[16px] font-semibold text-foreground">
        {isEmpty ? <span className="text-muted">Not provided</span> : value}
      </span>
    </div>
  );
}

function SensitiveField({
  label,
  value,
  revealed,
  onToggle,
  type,
}: {
  label: string;
  value: string | null;
  revealed: boolean;
  onToggle: () => void;
  type: "aadhaar" | "pan";
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* silent */
    }
  };

  const isEmpty = value == null || String(value).trim() === "";
  const displayValue = revealed ? value : (type === "aadhaar" ? maskAadhaar(value) : maskPan(value));
  const icon = revealed ? <EyeOff className="w-3.5 h-3.5 text-muted cursor-pointer" onClick={onToggle} /> : <Eye className="w-3.5 h-3.5 text-muted cursor-pointer" onClick={onToggle} />;

  return (
    <div className="space-y-1">
      <span className="text-[13px] text-muted block uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[16px] font-semibold text-foreground truncate">
          {isEmpty ? <span className="text-muted">Not provided</span> : displayValue}
        </span>
        {!isEmpty && (
          <>
            <button
              onClick={onToggle}
              className="w-6 h-6 rounded bg-gray-50 text-muted hover:bg-gray-100 flex items-center justify-center transition-colors"
              aria-label={revealed ? "Hide" : "Reveal"}
            >
              {icon}
            </button>
            {!revealed || copied ? null : (
              <button
                onClick={handleCopy}
                className="w-6 h-6 rounded bg-green-50 text-green-700 hover:bg-green-100 flex items-center justify-center transition-colors"
                aria-label="Copy"
                title="Copy"
              >
                <Copy className="w-3 h-3" />
              </button>
            )}
            {copied && !revealed ? null : copied && revealed ? (
              <span className="text-[10px] text-green-600 font-medium">Copied</span>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default function GrowerDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [grower, setGrower] = useState<GrowerDetail | null>(null);
  const [sensitive, setSensitive] = useState<SensitiveData | null>(null);
  const [revealed, setRevealed] = useState<{ aadhaar: boolean; pan: boolean }>({ aadhaar: false, pan: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrower = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/growers/${id}`);
      if (res.status === 404) throw new Error("Grower not found");
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setGrower(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchSensitive = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/admin/growers/${id}/sensitive`);
      if (!res.ok) return;
      const json = await res.json();
      setSensitive({ aadhaar: json.aadhaar ?? null, pan: json.pan ?? null });
    } catch {
      // Silent fail - sensitive data may not be available
    }
  }, [id]);

  useEffect(() => {
    fetchGrower();
    fetchSensitive();
  }, [fetchGrower, fetchSensitive]);

  const aadhaarValue = sensitive?.aadhaar ? (revealed.aadhaar ? sensitive.aadhaar : maskAadhaar(sensitive.aadhaar)) : null;
  const panValue = sensitive?.pan ? (revealed.pan ? sensitive.pan : maskPan(sensitive.pan)) : null;

  if (loading) {
    return (
      <PageShell title="Grower Profile" segments={[{ label: "Dashboard", href: "/admin" }, { label: "Growers", href: "/admin/growers" }, { label: "Loading..." }]}>
        <div className="bg-white rounded-[12px] border border-border shadow-sm p-8 animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-40" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Grower Profile" segments={[{ label: "Dashboard", href: "/admin" }, { label: "Growers", href: "/admin/growers" }, { label: "Error" }]}>
        <div className="bg-white rounded-[12px] border border-border shadow-sm p-12 text-center">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <Link href="/admin/growers" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0B4A2E] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Growers
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!grower) return null;

  const statusColor = grower.status === "APPROVED" ? "bg-green-100 text-green-700" : grower.status === "PENDING" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700";
  const membershipYear = grower.registeredAt ? new Date(grower.registeredAt).getFullYear().toString() : "";
  const validUntil = membershipExpiryDate(grower.approvedAt, grower.registeredAt);

  return (
    <PageShell
      title="Grower Profile"
      segments={[{ label: "Dashboard", href: "/admin" }, { label: "Growers", href: "/admin/growers" }, { label: grower.name }]}
      actions={
        <Link href="/admin/growers" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[10px] border border-border text-xs font-medium text-muted hover:text-foreground hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
      }
    >
      <div className="space-y-5">
        {/* Profile Header */}
        <div className="bg-white rounded-[12px] border border-border shadow-sm p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{grower.name}</h2>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusColor}`}>{grower.status}</span>
            </div>
            <p className="text-sm text-muted mt-0.5">Registered on {formatDateIN(grower.registeredAt)}</p>
          </div>
        </div>

        {/* Single Grower Details Card */}
        <div className="bg-white rounded-[12px] border border-border shadow-sm p-6">
          <h3 className="text-sm font-bold text-foreground mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-[#0B4A2E]" /> Grower Details
          </h3>

          {/* Section A: Personal & Contact */}
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Personal &amp; Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Full Name" value={grower.name} />
            <Field label="Mobile" value={grower.mobile} />
            <Field label="Email" value={grower.email} />
            <Field label="District" value={grower.district?.name} />
            <Field label="Village" value={grower.village?.name} />
            <Field label="Address" value={grower.address} />
          </div>

          <div className="h-px bg-border my-5"></div>

          {/* Section B: Identity */}
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Identity</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SensitiveField label="Aadhaar Number" value={aadhaarValue ?? null} revealed={revealed.aadhaar} onToggle={() => setRevealed((p) => ({ ...p, aadhaar: !p.aadhaar }))} type="aadhaar" />
            <SensitiveField label="PAN Number" value={panValue ?? null} revealed={revealed.pan} onToggle={() => setRevealed((p) => ({ ...p, pan: !p.pan }))} type="pan" />
          </div>

          <div className="h-px bg-border my-5"></div>

          {/* Section C: Tea Garden */}
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Tea Garden</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Garden Name" value={grower.teaGardenName} />
            <Field label="Garden Address / Location" value={grower.address} />
            <Field label="Tea Area (Ha)" value={grower.teaArea != null ? grower.teaArea.toFixed(2) : ""} />
            <Field label="Tea Area (Acres)" value={grower.teaArea != null ? (grower.teaArea * 2.47105).toFixed(2) : ""} />
            <Field label="Tea Variety" value={grower.teaVariety} />
            <Field label="Plantation Year" value={grower.plantationYear?.toString()} />
            <Field label="Organic Status" value={grower.organicStatus} />
            <Field label="Annual Production" value={grower.annualProduction != null ? grower.annualProduction.toString() : ""} />
            <Field label="Membership Year" value={membershipYear} />
          </div>

          <div className="h-px bg-border my-5"></div>

          {/* Section D: Key Dates */}
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Key Dates</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Registered Date" value={formatDateIN(grower.registeredAt)} />
            <Field label="Approved Date" value={grower.approvedAt ? formatDateIN(grower.approvedAt) : "Not approved"} />
            <Field label="Valid Until" value={validUntil} />
          </div>
        </div>

        {/* Membership ID Card */}
        <IdCardSection growerId={grower.id} />
      </div>
    </PageShell>
  );
}
