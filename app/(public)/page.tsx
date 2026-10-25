import HeroSection from "@/components/sections/hero";
import FeatureStrip from "@/components/sections/feature-strip";
import AnalyticsDashboard from "@/components/sections/analytics";
import MarketplaceSection from "@/components/sections/marketplace";

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <div className="relative bg-[#f4f9f5]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-[#86efac]/40 blur-3xl" />
          <div className="absolute right-[-8%] top-[18%] h-[520px] w-[520px] rounded-full bg-[#15803d]/15 blur-3xl" />
          <div className="absolute left-[-5%] top-[55%] h-[480px] w-[480px] rounded-full bg-[#bbf7d0]/50 blur-3xl" />
          <div className="absolute bottom-0 right-[10%] h-[420px] w-[420px] rounded-full bg-[#86efac]/30 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-8 lg:px-12 xl:px-16 pb-12 lg:pb-14">
          <FeatureStrip />

          <div className="mt-10 lg:mt-12">
            <AnalyticsDashboard />
          </div>

          <div className="mt-10 lg:mt-12">
            <MarketplaceSection />
          </div>
        </div>
      </div>
    </>
  );
}
