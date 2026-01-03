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
  title: "Pilot Resume",
  description: "Professional pilot profile and flight resume",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#eaf1f8] text-[#0b1f33]`}
      >
        <header className="sticky top-0 z-50 border-b border-[#d4e0ec] bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <a href="/" className="text-lg font-semibold text-[#0f2f4b]">
              Flight Deck Profile
            </a>
            <nav className="flex items-center gap-2 text-sm font-semibold text-[#0f2f4b]">
              {[
                { href: "/", label: "Home" },
                { href: "/pilot", label: "Pilot" },
                { href: "/resume", label: "Resume" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 transition hover:bg-[#e6eef7] hover:text-[#1f4b71]"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
