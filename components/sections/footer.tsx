"use client";

import { Mail, Phone, MapPin, ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import NewsletterForm from "@/components/sections/newsletter-form";
import { useSettings } from "@/lib/use-settings";
import { FacebookIcon, InstagramIcon, TwitterIcon, YouTubeIcon } from "@/components/social-icons";

export default function Footer() {
  const { settings } = useSettings();
  const { contact, general } = settings;
  const socials = [
    { name: "Facebook", href: settings.social.facebook || "#", icon: FacebookIcon },
    { name: "Twitter", href: settings.social.twitter || "#", icon: TwitterIcon },
    { name: "Instagram", href: settings.social.instagram || "#", icon: InstagramIcon },
    { name: "YouTube", href: settings.social.youtube || "#", icon: YouTubeIcon },
  ];
  return (
    <footer className="relative text-white overflow-hidden">
      <div className="gloss gloss-soft absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url(/footer-image/footer-bg.png)" }} />
      <div className="absolute inset-0 bg-[#042C1A]/60" />
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-8 lg:px-12 xl:px-16 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="gloss w-10 h-10 rounded-full overflow-hidden">
              <Image src="/logo/logo.png" alt="APSTGA" width={40} height={40} className="w-full h-full object-cover" />
            </div>
              <div>
                <span className="text-base font-bold text-white">APSTGA</span>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-5">
              Arunachal Pradesh Small Tea Growers Association — Empowering small tea growers across the state.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a key={s.name} href={s.href} target={s.href !== "#" ? "_blank" : undefined} rel={s.href !== "#" ? "noopener noreferrer" : undefined} className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all" aria-label={s.name}>
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-5">Quick Links</h4>
            <ul className="space-y-2.5">
              {["About Us", "Growers", "Statistics", "Our Work", "Our Members", "Contact", "Admin Login"].map((l) => {
                const href =
                  l === "Admin Login" ? "/login" :
                  l === "About Us" ? "/about" :
                  l === "Our Work" ? "/our-work" :
                  l === "Our Members" ? "/members" :
                  `/${l.toLowerCase().replace(/\s+/g, "-")}`;
                const Icon = l === "Admin Login" ? LogIn : ArrowRight;
                return (
                <li key={l}>
                  <Link href={href} className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1.5">
                    <Icon className="w-3 h-3" /> {l}
                  </Link>
                </li>
              )})}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-5">Contact Info</h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-white/50 mt-0.5 shrink-0" />
                <span className="text-sm text-white/60">{contact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-white/50 shrink-0" />
                <span className="text-sm text-white/60">{contact.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-white/50 shrink-0" />
                <span className="text-sm text-white/60">{contact.email}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-5">Newsletter</h4>
            <p className="text-sm text-white/60 mb-4 leading-relaxed">
              Subscribe to get the latest updates and news from APSTGA.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/10">
        <div className="w-full max-w-[1600px] mx-auto px-8 lg:px-12 xl:px-16 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-white/40">{general.footerText || "© 2026 APSTGA. All rights reserved."}</span>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-sm text-white/40 hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-white/40 hover:text-white/60 transition-colors">Terms of Service</Link>
            <Link href="/sitemap" className="text-sm text-white/40 hover:text-white/60 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
