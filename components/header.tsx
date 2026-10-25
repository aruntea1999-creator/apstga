"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useSettings } from "@/lib/use-settings";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Growers", href: "/growers" },
  { name: "Statistics", href: "/statistics" },
  { name: "Register", href: "/register" },
  { name: "Our Work", href: "/our-work" },
  { name: "Our Members", href: "/members" },
  { name: "Contact Us", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { settings } = useSettings();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/60 bg-white/75 shadow-[0_10px_30px_-18px_rgba(11,74,46,0.45)] backdrop-blur-xl backdrop-saturate-150">
      <div className="w-full max-w-[1600px] mx-auto px-8 lg:px-12 xl:px-16">
        <div className="flex h-[78px] lg:h-[92px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <span className="gloss inline-flex rounded-full">
              <Image
                src="/logo/logo.png"
                alt="APSTGA Logo"
                width={64}
                height={64}
                className="w-14 h-14 lg:w-16 lg:h-16 rounded-full object-cover"
              />
            </span>
            <span className="block">
              <span className="block text-[15px] lg:text-base font-bold text-primary leading-tight">{settings.general.siteName}</span>
              <span className="block text-[11px] text-muted leading-tight">Arunachal Pradesh</span>
              <span className="hidden xl:block text-[11px] text-muted leading-tight">{settings.general.tagline}</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center h-full">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center h-full whitespace-nowrap px-2 xl:px-4 text-[13px] xl:text-sm font-medium transition-colors ${
                    isActive ? "text-primary" : "text-foreground/70 hover:text-primary"
                  }`}
                >
                  {item.name}
                  <span
                    className={`absolute bottom-0 left-2 right-2 xl:left-4 xl:right-4 h-[3px] rounded-t-full bg-primary transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden border-t border-white/60 bg-white/95 backdrop-blur-xl shadow-lg">
          <div className="px-8 py-3 space-y-1">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                  pathname === item.href ? "text-primary bg-primary/5" : "text-foreground/70 hover:text-primary hover:bg-gray-50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

          </div>
        </div>
      )}
    </header>
  );
}
