"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, CheckCircle, XCircle, Loader2, FileText, Image as ImageIcon, ExternalLink } from "lucide-react";
import PageShell from "@/components/admin/page-shell";

export default function RegistrationDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [grower, setGrower] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [toast, setToast] = useState<{ type: string; text: string } | null>(null);

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

  useEffect(() => { fetchGrower(); }, [fetchGrower]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleApprove = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/admin/growers/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (!res.ok) throw new Error("Failed");
      setToast({ type: "success", text: "Grower approved successfully" });
      fetchGrower();
    } catch {
      setToast({ type: "error", text: "Failed to approve grower" });
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/admin/growers/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });
      if (!res.ok) throw new Error("Failed");
      setToast({ type: "success", text: "Grower registration rejected" });
      fetchGrower();
    } catch {
      setToast({ type: "error", text: "Failed to reject grower" });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <PageShell title="Request Detail" segments={[{ label: "Dashboard", href: "/admin" }, { label: "Registrations", href: "/admin/registrations" }, { label: "Loading..." }]}>
        <div className="bg-white rounded-[12px] border border-border shadow-sm p-8 animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-40" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-32" />
              </div>
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Request Detail" segments={[{ label: "Dashboard", href: "/admin" }, { label: "Registrations", href: "/admin/registrations" }, { label: "Error" }]}>
        <div className="bg-white rounded-[12px] border border-border shadow-sm p-12 text-center">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <Link href="/admin/registrations" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0B4A2E] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Registrations
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!grower) return null;

  const statusColor = grower.status === "APPROVED" ? "bg-green-100 text-green-700" : grower.status === "PENDING" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700";

  return (
    <PageShell
      title="Request Detail"
      segments={[{ label: "Dashboard", href: "/admin" }, { label: "Registrations", href: "/admin/registrations" }, { label: "Request Detail" }]}
      actions={
        <Link href="/admin/registrations" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[10px] border border-border text-xs font-medium text-muted hover:text-foreground hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
      }
    >
      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-[12px] text-sm flex items-center gap-2 ${
          toast.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          {toast.text}
        </div>
      )}

      <div className="space-y-5">
        {/* Header */}
        <div className="bg-white rounded-[12px] border border-border shadow-sm p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{grower.name}</h2>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusColor}`}>{grower.status}</span>
            </div>
            <p className="text-sm text-muted mt-0.5">Registered on {new Date(grower.registeredAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-[12px] border border-border shadow-sm p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#0B4A2E]" /> Grower Details
            </h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-muted">Name:</span> <span className="font-medium ml-2">{grower.name}</span></div>
              <div><span className="text-muted">Mobile:</span> <span className="font-medium ml-2">{grower.mobile}</span></div>
              <div><span className="text-muted">Email:</span> <span className="font-medium ml-2">{grower.email || "—"}</span></div>
              <div><span className="text-muted">Member/App No:</span> <span className="font-medium ml-2">{grower.membershipId}</span></div>
              <div><span className="text-muted">Circle:</span> <span className="font-medium ml-2">{grower.circle || "—"}</span></div>
              <div><span className="text-muted">District:</span> <span className="font-medium ml-2">{grower.district?.name}</span></div>
              <div><span className="text-muted">Village:</span> <span className="font-medium ml-2">{grower.village?.name}</span></div>
              <div><span className="text-muted">Tea Area:</span> <span className="font-medium ml-2">{grower.teaArea ? `${grower.teaArea} Ha` : "—"}</span></div>
              <div><span className="text-muted">Garden:</span> <span className="font-medium ml-2">{grower.teaGardenName || "—"}</span></div>
              <div><span className="text-muted">Address:</span> <span className="font-medium ml-2">{grower.address || "—"}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-[12px] border border-border shadow-sm p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0B4A2E]" /> Documents
            </h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-muted">Aadhaar:</span> <span className="font-medium ml-2">{grower.aadhaar || "—"}</span></div>
              <div><span className="text-muted">PAN:</span> <span className="font-medium ml-2">{grower.pan || "—"}</span></div>
              <div><span className="text-muted">Bank Name:</span> <span className="font-medium ml-2">{grower.bankName || "—"}</span></div>
              <div><span className="text-muted">Branch:</span> <span className="font-medium ml-2">{grower.bankBranch || "—"}</span></div>
              <div><span className="text-muted">Account:</span> <span className="font-medium ml-2">{grower.accountNumber || "—"}</span></div>
              <div><span className="text-muted">IFSC:</span> <span className="font-medium ml-2">{grower.ifscCode || "—"}</span></div>
              <div><span className="text-muted">Uploaded Files:</span> <span className="font-medium ml-2">{grower.attachments?.length ? `${grower.attachments.length} file(s)` : "—"}</span></div>
            </div>
          </div>
        </div>

        {/* Uploaded Documents */}
        <div className="bg-white rounded-[12px] border border-border shadow-sm p-5">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#0B4A2E]" /> Uploaded Documents
          </h3>
          {!grower.attachments?.length ? (
            <p className="text-sm text-muted">No files uploaded with this registration.</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {grower.attachments.map((a: any) => {
                const isImage = a.mimeType?.startsWith("image/");
                const url = `/api/admin/growers/${grower.id}/documents/${a.id}`;
                const label: Record<string, string> = {
                  passportPhoto: "Passport Photo",
                  aadhaarCard: "Aadhaar Card",
                  bankPassbook: "Bank Passbook",
                };
                return (
                  <div key={a.id} className="w-[220px] rounded-[10px] border border-border overflow-hidden bg-gray-50">
                    <div className="h-[120px] bg-gray-100 flex items-center justify-center overflow-hidden">
                      {isImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt={a.name} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-foreground">{label[a.type] || a.type}</p>
                      <p className="text-[11px] text-muted truncate mt-0.5">{a.name} · {(a.size / 1024).toFixed(1)} KB</p>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 flex h-8 w-full items-center justify-center gap-1 rounded-[8px] border border-border text-[11px] font-semibold text-[#0B4A2E] hover:bg-emerald-50 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> View
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {grower.status === "PENDING" && (
          <div className="bg-white rounded-[12px] border border-border shadow-sm p-5 flex items-center justify-end gap-3">
            <button
              onClick={handleReject}
              disabled={verifying}
              className="flex items-center gap-1.5 h-10 px-5 rounded-[10px] border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={verifying}
              className="flex items-center gap-1.5 h-10 px-5 rounded-[10px] bg-[#0B4A2E] text-white text-sm font-semibold hover:bg-[#0A3D26] disabled:opacity-50 transition-colors"
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {verifying ? "Approving..." : "Approve Grower"}
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
