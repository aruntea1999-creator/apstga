import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const DEFAULT_SETTINGS = {
  general: {
    siteName: "APSTGA",
    tagline: "Arunachal Pradesh Small Tea Growers Association",
    registrationNumber: "SR/ITA/617",
    footerText: "© 2026 APSTGA. All rights reserved.",
    metaTitle: "APSTGA - Arunachal Pradesh Small Tea Growers Association",
    metaDescription: "Uniting small tea growers across Arunachal Pradesh for sustainable growth, better opportunities and a prosperous future.",
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

export function parseSettings(rows: { key: string; value: string | null }[]): any {
  const out: any = {};
  for (const section of Object.keys(DEFAULT_SETTINGS)) {
    const row = rows.find((r) => r.key === section);
    try {
      out[section] = row?.value ? JSON.parse(row.value) : DEFAULT_SETTINGS[section as keyof typeof DEFAULT_SETTINGS];
    } catch {
      out[section] = DEFAULT_SETTINGS[section as keyof typeof DEFAULT_SETTINGS];
    }
  }
  return out;
}

export async function loadSettings() {
  const rows = await prisma.setting.findMany();
  return parseSettings(rows);
}

export async function GET_PUBLIC() {
  try {
    const rows = await prisma.setting.findMany();
    const merged = parseSettings(rows);
    const general = { ...DEFAULT_SETTINGS.general, ...merged.general };
    const hero = { ...DEFAULT_SETTINGS.hero, ...merged.hero };
    const contact = { ...DEFAULT_SETTINGS.contact, ...merged.contact };
    const social = { ...DEFAULT_SETTINGS.social, ...merged.social };
    return NextResponse.json({ general, hero, contact, social });
  } catch {
    return NextResponse.json({ general: DEFAULT_SETTINGS.general, hero: DEFAULT_SETTINGS.hero, contact: DEFAULT_SETTINGS.contact, social: DEFAULT_SETTINGS.social });
  }
}