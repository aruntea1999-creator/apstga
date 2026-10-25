import type { Metadata } from "next";
import VerifyPageClient from "./verify-client";

export const metadata: Metadata = {
  title: "Member Verification | APSTGA",
  description: "Verify APSTGA membership — Arunachal Pradesh Small Tea Growers Association",
  robots: { index: false, follow: false },
};

export default function VerifyPage() {
  return <VerifyPageClient />;
}
