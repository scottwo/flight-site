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
import ThemeToggle from "@/components/ThemeToggle";

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
        <body className="antialiased bg-[var(--bg)] text-[var(--text)]">
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{const t=localStorage.getItem("mypilotpage-theme");const sysDark=typeof window!=="undefined"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;const th=t==="dark"||t==="light"?t:(sysDark?"dark":"light");document.documentElement.classList.toggle("dark",th==="dark");document.documentElement.setAttribute("data-theme",th);}catch(e){}})();`,
            }}
          />
          <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in srgb,var(--panel) 85%,transparent)] backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <a href="/" className="text-lg font-semibold text-[var(--text)]">
                MyPilotPage
              </a>
              <nav className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <a
                  href="/"
                  className="rounded-full px-4 py-2 transition hover:bg-[var(--panel-muted)] hover:text-[var(--text-strong)]"
                >
                  Home
                </a>
                <a
                  href="/p/demo"
                  className="rounded-full px-4 py-2 transition hover:bg-[var(--panel-muted)] hover:text-[var(--text-strong)]"
                >
                  Demo
                </a>
                <a
                  href="/pricing"
                  className="rounded-full px-4 py-2 transition hover:bg-[var(--panel-muted)] hover:text-[var(--text-strong)]"
                >
                  Pricing
                </a>
                <SignedIn>
                  <a
                    href="/dashboard"
                    className="rounded-full px-4 py-2 transition hover:bg-[var(--panel-muted)] hover:text-[var(--text-strong)]"
                  >
                    Dashboard
                  </a>
                </SignedIn>
              </nav>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-muted)] hover:text-[var(--text-strong)]">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-90">
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
          <footer className="mt-12 border-t border-[var(--border)] bg-[color-mix(in srgb,var(--panel) 85%,transparent)]">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-6 text-sm text-[var(--muted)]">
              <a href="/" className="hover:text-[var(--text-strong)]">
                Home
              </a>
              <span className="text-[var(--muted-2)]">•</span>
              <a href="/pricing" className="hover:text-[var(--text-strong)]">
                Pricing
              </a>
              <span className="text-[var(--muted-2)]">•</span>
              <a href="/privacy" className="hover:text-[var(--text-strong)]">
                Privacy
              </a>
              <span className="text-[var(--muted-2)]">•</span>
              <a href="/terms" className="hover:text-[var(--text-strong)]">
                Terms
              </a>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
