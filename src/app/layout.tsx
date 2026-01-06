import type { Metadata } from "next";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyPilotPage",
  description: "Create a shareable pilot profile with stats, maps, and currency—powered by your logbook.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className="antialiased bg-[#eaf1f8] text-[#0b1f33]"
        >
          <header className="sticky top-0 z-50 border-b border-[#d4e0ec] bg-white/85 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <a href="/" className="text-lg font-semibold text-[#0f2f4b]">
                MyPilotPage
              </a>
              <nav className="flex items-center gap-2 text-sm font-semibold text-[#0f2f4b]">
                <a
                  href="/"
                  className="rounded-full px-4 py-2 transition hover:bg-[#e6eef7] hover:text-[#1f4b71]"
                >
                  Home
                </a>
                <a
                  href="/p/demo"
                  className="rounded-full px-4 py-2 transition hover:bg-[#e6eef7] hover:text-[#1f4b71]"
                >
                  Demo
                </a>
                <a
                  href="/pricing"
                  className="rounded-full px-4 py-2 transition hover:bg-[#e6eef7] hover:text-[#1f4b71]"
                >
                  Pricing
                </a>
                <SignedIn>
                  <a
                    href="/dashboard"
                    className="rounded-full px-4 py-2 transition hover:bg-[#e6eef7] hover:text-[#1f4b71]"
                  >
                    Dashboard
                  </a>
                </SignedIn>
              </nav>
              <div className="flex items-center gap-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="rounded-full border border-[#d4e0ec] px-4 py-2 text-sm font-semibold text-[#0f2f4b] transition hover:bg-[#e6eef7] hover:text-[#1f4b71]">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded-full bg-[#1f4b71] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#163552]">
                      Sign up
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton appearance={{ elements: { userButtonAvatarBox: "ring-2 ring-[#1f4b71]" } }} />
                </SignedIn>
              </div>
            </div>
          </header>
          {children}
          <footer className="mt-12 border-t border-[#d4e0ec] bg-white/80">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-6 text-sm text-[#35506c]">
              <a href="/" className="hover:text-[#1f4b71]">
                Home
              </a>
              <span className="text-[#9cb6cf]">•</span>
              <a href="/pricing" className="hover:text-[#1f4b71]">
                Pricing
              </a>
              <span className="text-[#9cb6cf]">•</span>
              <a href="/privacy" className="hover:text-[#1f4b71]">
                Privacy
              </a>
              <span className="text-[#9cb6cf]">•</span>
              <a href="/terms" className="hover:text-[#1f4b71]">
                Terms
              </a>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
