import { Leaf, Users, Handshake, GraduationCap, Globe, Cog } from "lucide-react";

const features = [
  { icon: Users, label: "Represent small tea growers' interests before state and central authorities" },
  { icon: Cog, label: "Facilitate access to government schemes and subsidies" },
  { icon: Globe, label: "Advocate for tea auction centres and market linkages" },
  { icon: GraduationCap, label: "Support training, certification, and capacity-building initiatives" },
  { icon: Handshake, label: "Champion policy reforms for the tea sector in Arunachal Pradesh" },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-white py-20">
        <div className="w-full max-w-[1000px] mx-auto px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-5">
              <Leaf className="w-4 h-4" />
              Established 1999
            </div>
            <h1 className="text-[40px] md:text-[48px] font-extrabold text-foreground leading-[1.1] tracking-[-0.02em] mb-3">
              About <span className="text-primary">APSTGA</span>
            </h1>
            <p className="text-base text-muted">
              Regd. No. SR/ITA/617
            </p>
          </div>

          <div className="space-y-6 text-[16px] text-foreground/80 leading-relaxed">
            <p>
              The <strong>Arunachal Pradesh Small Tea Growers&apos; Association (APSTGA)</strong> is the collective voice of small tea growers across Arunachal Pradesh. Established in 1999, we have spent over two decades working to strengthen the tea farming community, from the plains of Longding to the hills across the state.
            </p>
            <p>
              We represent thousands of small growers who form the backbone of Arunachal&apos;s emerging tea economy. Our mission is simple: to ensure that every tea grower — regardless of the size of their holding — has access to fair markets, government schemes, technical knowledge, and a platform to be heard.
            </p>
            <p>
              Through sustained advocacy, we work closely with state authorities on policy matters including tea auction infrastructure, Tea Board registration, quality certification, and welfare schemes tailored for small growers. We believe that with the right support, Arunachal Pradesh&apos;s tea sector can become a model of sustainable, farmer-first growth.
            </p>
          </div>

          <div className="mt-14">
            <h2 className="text-[28px] font-extrabold text-foreground text-center mb-3">What We Do</h2>
            <p className="text-center text-muted text-[15px] mb-10">
              Our work is driven by the needs of small tea growers across the state.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 rounded-[14px] border border-border bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="w-11 h-11 rounded-[10px] bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-foreground leading-snug">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
