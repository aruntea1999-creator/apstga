"use client";

import { useEffect, useState } from "react";

export const DEFAULT_SITE = {
  general: {
    siteName: "APSTGA",
    tagline: "Arunachal Pradesh Small Tea Growers Association",
    registrationTitle: "SR/ITA/617",
    footerText: "© 2026 APSTGA. All rights reserved.",
    metaTitle: "APSTGA - Arunachal Pradesh Small Tea Growers Association",
    metaDescription:
      "Uniting small tea growers across Arunachal Pradesh for sustainable growth, better opportunities and a prosperous future.",
  },
  hero: {
    title: "Empowering Small Tea Growers. Building A Stronger Arunachal.",
    subtitle:
      "Uniting small tea growers across Arunachal Pradesh for sustainable growth, better opportunities and a prosperous future.",
  },
  contact: {
    address: "Jollang, Itanagar, near central jail, Arunachal Pradesh 791113",
    phone: "+91 6002453543",
    email: "aruntea1999@gmail.com",
  },
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61580852350165",
    twitter: "",
    instagram: "",
    youtube: "",
  },
};

export type SiteSettings = typeof DEFAULT_SITE;

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        if (!json || json.error) return;
        setSettings({
          general: { ...DEFAULT_SITE.general, ...json.general },
          hero: { ...DEFAULT_SITE.hero, ...json.hero },
          contact: { ...DEFAULT_SITE.contact, ...json.contact },
          social: { ...DEFAULT_SITE.social, ...json.social },
        });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return { settings, loaded };
}