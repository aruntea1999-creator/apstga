"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  ShieldX,
  Loader2,
  BadgeCheck,
  MapPin,
  Leaf,
  CalendarDays,
  SearchX,
  ArrowLeft,
} from "lucide-react";
import apstgaLogo from "@/public/logo/logo.png";
import { formatDate } from "@/lib/id-card";

interface VerifyResult {
  name: string;
  membershipId: string;
  district: string;
  status: "ACTIVE" | "EXPIRED";
  validUntil: string;
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-3 border-b border-[#E5E7EB] last:border-0">
      <span className="text-[13px] text-[#6B7280] shrink-0 flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="text-[13px] font-semibold text-[#111827] text-right break-words">{value}</span>
    </div>
  );
}

export default function VerifyPageClient() {
  const params = useParams();
  const memberId = (params?.memberId as string) ?? "";
  const hasMemberId = Boolean(memberId);

  const [data, setData] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(hasMemberId);
  const [notFound, setNotFound] = useState(!hasMemberId);

  useEffect(() => {
    if (!memberId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/verify/${encodeURIComponent(memberId)}`);
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error("Failed");
        const json = (await res.json()) as VerifyResult;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  const active = data?.status === "ACTIVE";

  return (
    <section className="bg-[#F8FAF8] min-h-screen border-b border-border">
      <div className="w-full max-w-[1600px] mx-auto px-8 lg:px-12 xl:px-16 py-12 flex justify-center">
        <div className="w-full max-w-[580px]">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center mx-auto mb-4 p-2">
              <Image
                src={apstgaLogo}
                alt="Arunachal Pradesh Small Tea Growers' Association"
                width={64}
                height={64}
                className="w-16 h-16 object-contain"
                priority
              />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0B4A2E]">
              Arunachal Pradesh Small Tea Growers&apos; Association
            </p>
            <h1 className="text-2xl font-extrabold text-[#111827] mt-2">Member Verification</h1>
            <p className="text-sm text-[#6B7280] mt-1">Verifying membership ID {memberId}</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            {loading && (
              <div className="p-16 flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-[#0B4A2E]" />
                <p className="text-sm text-[#6B7280]">Checking membership records...</p>
              </div>
            )}

            {!loading && notFound && (
              <div className="p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <SearchX className="w-7 h-7 text-red-500" />
                </div>
                <h2 className="text-xl font-extrabold tracking-wide text-[#111827]">NOT A VALID MEMBER</h2>
                <p className="text-sm text-[#6B7280] mt-2 mb-5 max-w-[380px] mx-auto">
                  No valid APSTGA membership record matches ID {memberId || "—"}. If you believe this is an
                  error, please contact the APSTGA office.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold hover:bg-[#0A3D26] transition-colors"
                >
                  Contact APSTGA
                </Link>
              </div>
            )}

            {!loading && data && (
              <div>
                <div className="bg-[#0B4A2E] px-6 py-4 flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1 rounded-full ${
                      active ? "text-white bg-white/15" : "text-white bg-amber-500/35"
                    }`}
                  >
                    {active ? <BadgeCheck className="w-4 h-4" /> : <ShieldX className="w-4 h-4" />}
                    {active ? "Active Member" : "Membership Expired"}
                  </span>
                  <span className="ml-auto text-[12px] text-white/70 font-medium">{data.membershipId}</span>
                </div>

                <div className="px-6 py-6 text-center border-b border-[#E5E7EB]">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                      active ? "bg-[#0B4A2E]/10" : "bg-amber-50"
                    }`}
                  >
                    {active ? (
                      <ShieldCheck className="w-8 h-8 text-[#0B4A2E]" />
                    ) : (
                      <ShieldX className="w-8 h-8 text-amber-600" />
                    )}
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B7280]">
                    Registered Name
                  </p>
                  <h2 className="text-xl font-extrabold text-[#111827] mt-1">{data.name}</h2>
                  <p className="text-[12px] text-[#6B7280] mt-2">
                    {active
                      ? "This is a valid APSTGA grower membership."
                      : "This membership is no longer active."}
                  </p>
                </div>

                <div className="px-6 py-3">
                  <InfoRow
                    label="Membership ID"
                    value={data.membershipId}
                    icon={<BadgeCheck className="w-4 h-4 text-[#0B4A2E]" />}
                  />
                  <InfoRow
                    label="District"
                    value={data.district}
                    icon={<MapPin className="w-4 h-4 text-[#0B4A2E]" />}
                  />
                  <InfoRow
                    label="Membership Status"
                    value={data.status}
                    icon={<Leaf className="w-4 h-4 text-[#0B4A2E]" />}
                  />
                  <InfoRow
                    label="Valid Until"
                    value={formatDate(data.validUntil, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                    icon={<CalendarDays className="w-4 h-4 text-[#0B4A2E]" />}
                  />
                </div>

                <div
                  className={`px-6 py-3 border-t flex items-center gap-2 text-[12px] font-semibold ${
                    active
                      ? "bg-green-50 border-green-100 text-green-700"
                      : "bg-amber-50 border-amber-100 text-amber-700"
                  }`}
                >
                  {active ? <BadgeCheck className="w-4 h-4" /> : <ShieldX className="w-4 h-4" />}
                  {active
                    ? "This membership is currently ACTIVE."
                    : "This membership has EXPIRED. Please contact APSTGA for renewal."}
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-[11px] leading-relaxed text-[#6B7280] mt-4 max-w-[460px] mx-auto">
            This page displays public membership verification details only. It does not expose date of birth,
            address, phone number or other private information.
          </p>

          <div className="text-center mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0B4A2E] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to APSTGA Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
