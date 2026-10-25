"use client";

import { FileText, CheckCircle } from "lucide-react";

export default function RegistrationSidebar() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-[#0B4A2E]" />
          <h3 className="text-sm font-bold text-foreground">Registration Guidelines</h3>
        </div>
        <ul className="space-y-2">
          {[
            "Ensure all details match your official documents",
            "Upload clear, legible scanned copies only (PDF, JPG, PNG)",
            "File size must be under 2 MB per document",
            "Aadhaar number is mandatory for verification",
            "Incomplete applications will not be processed",
          ].map((g) => (
            <li key={g} className="flex items-start gap-2 text-[13px] text-muted leading-snug">
              <div className="w-4 h-4 rounded-full bg-[#0B4A2E] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="w-2.5 h-2.5 text-white" />
              </div>
              {g}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-4">
        <h3 className="text-sm font-bold text-foreground mb-1.5">Note</h3>
        <p className="text-[13px] text-[#B8860B] font-medium leading-snug">
          All fields marked with <span className="text-red-500">*</span> are mandatory. Incomplete applications will not be processed.
        </p>
      </div>

      <div className="bg-[#0B4A2E] rounded-lg p-4 text-center">
        <p className="text-sm font-semibold text-white leading-snug">
          Empowering Small Tea Growers.
        </p>
        <p className="text-[11px] text-white/60 mt-0.5">Building A Stronger Arunachal.</p>
      </div>
    </div>
  );
}
