import Link from "next/link";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "5 Crowns Scorekeeper",
  description: "Track games, per-round scores, and player stats for 5 Crowns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        <div className="min-h-screen">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md shadow-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-700">
                5 Crowns
              </span>
              <nav className="flex items-center gap-2 text-sm">
                {[
                  { href: "/", label: "Home" },
                  { href: "/games", label: "Games" },
                  { href: "/players", label: "Players" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-transparent px-4 py-2 font-medium text-slate-700 transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
