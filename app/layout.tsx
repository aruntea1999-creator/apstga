import localFont from "next/font/local";
import type { Metadata } from "next";
import { SessionProvider } from "./session-provider";
import "./globals.css";

// Self-hosted so production builds never depend on fonts.googleapis.com.
const inter = localFont({
  src: "../public/fonts/inter-latin.woff2",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "APSTGA - Arunachal Pradesh Small Tea Growers Association",
  description: "Official website of Arunachal Pradesh Small Tea Growers Association",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background" suppressHydrationWarning>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
