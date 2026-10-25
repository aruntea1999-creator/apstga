import Link from "next/link";
import { Leaf, ChevronRight } from "lucide-react";

const links = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Growers", href: "/growers" },
  { name: "Statistics", href: "/statistics" },
  { name: "Register", href: "/register" },
  { name: "Our Work", href: "/our-work" },
  { name: "Our Members", href: "/members" },
  { name: "Contact Us", href: "/contact" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
  { name: "Admin Login", href: "/login" },
];

export default function SitemapPage() {
  return (
    <section className="bg-white py-20">
      <div className="w-full max-w-[700px] mx-auto px-8 lg:px-12 xl:px-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-5">
            <Leaf className="w-4 h-4" />
            Site Navigation
          </div>
          <h1 className="text-[40px] md:text-[48px] font-extrabold text-foreground leading-[1.1] tracking-[-0.02em] mb-3">
            <span className="text-primary">Sitemap</span>
          </h1>
          <p className="text-muted text-[16px]">
            Complete list of all pages on the APSTGA website.
          </p>
        </div>

        <div className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-5 py-4 rounded-[12px] border border-border bg-white hover:bg-primary/5 hover:border-primary/20 transition-all group"
            >
              <ChevronRight className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
              <span className="text-[15px] font-medium text-foreground group-hover:text-primary transition-colors">
                {link.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
