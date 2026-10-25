import type { Metadata } from "next";
import GrowerDirectory from "./grower-directory";

export const metadata: Metadata = {
  title: "Growers Directory | APSTGA",
  description: "Search approved small tea growers of APSTGA by name, membership ID or Aadhaar number.",
};

export default function GrowersPage() {
  return (
    <section className="bg-[#F8FAF8] border-b border-border py-12 md:py-16">
      <div className="w-full max-w-[1000px] mx-auto px-8 lg:px-12 xl:px-16">
        <div className="text-center mb-8">
          <h1 className="text-[32px] md:text-[40px] font-extrabold text-foreground leading-[1.1] tracking-[-0.02em] mb-3">
            Our <span className="text-primary">Growers</span>
          </h1>
          <p className="text-muted text-[15px] max-w-xl mx-auto">
            Search the official register of APSTGA growers by name, membership ID or Aadhaar number
            and view verified garden details.
          </p>
        </div>
        <GrowerDirectory />
      </div>
    </section>
  );
}