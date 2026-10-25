"use client";

import { Globe, Leaf, Mail, Phone } from "lucide-react";
import { useSettings } from "@/lib/use-settings";
import { FacebookIcon, YouTubeIcon } from "@/components/social-icons";

export default function AnnouncementBar() {
  const { settings } = useSettings();
  const { email, phone } = settings.contact;
  const heading = settings.hero.title || "Empowering Small Tea Growers. Building A Stronger Arunachal.";

  const socials = [
    { label: "Facebook", href: settings.social.facebook || "#", icon: FacebookIcon },
    { label: "YouTube", href: settings.social.youtube || "#", icon: YouTubeIcon },
    { label: "Website", href: "#", icon: Globe },
  ];

  return (
    <div className="border-b border-white/10 bg-[#0b4a2e]/95 text-white backdrop-blur-xl backdrop-saturate-150">
      <div className="w-full max-w-[1600px] mx-auto px-8 lg:px-12 xl:px-16">
        <div className="flex h-9 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <Leaf className="w-3.5 h-3.5 shrink-0 text-[#86efac]" />
            <span className="text-[11px] md:text-xs font-medium truncate text-white/90">{heading}</span>
          </div>

          <div className="flex items-center gap-4 md:gap-5 shrink-0">
            {email && (
              <a href={`mailto:${email}`} className="hidden sm:flex items-center gap-1.5 text-white/80 hover:text-white text-[11px] md:text-xs transition-colors">
                <Mail className="w-3.5 h-3.5" />
                <span>{email}</span>
              </a>
            )}
            {phone && (
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hidden md:flex items-center gap-1.5 text-white/80 hover:text-white text-[11px] md:text-xs transition-colors">
                <Phone className="w-3.5 h-3.5" />
                <span>{phone}</span>
              </a>
            )}
            <div className="flex items-center gap-3">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  aria-label={label}
                  className="text-white/70 hover:text-[#86efac] transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
