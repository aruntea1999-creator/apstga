import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import apstgaLogo from "@/public/logo/logo.png";

export const metadata: Metadata = {
  title: "Member Verification | APSTGA",
  description: "Verify APSTGA membership — Arunachal Pradesh Small Tea Growers Association",
  robots: { index: false, follow: false },
};

export default function VerifyIndexPage() {
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
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <SearchX className="w-7 h-7 text-red-500" />
              </div>
              <h2 className="text-xl font-extrabold tracking-wide text-[#111827]">NOT A VALID MEMBER</h2>
              <p className="text-sm text-[#6B7280] mt-2 mb-5 max-w-[380px] mx-auto">
                No membership ID was provided in the verification link. Please scan the QR code printed on
                the membership card, or contact the APSTGA office for assistance.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold hover:bg-[#0A3D26] transition-colors"
              >
                Contact APSTGA
              </Link>
            </div>
          </div>

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
