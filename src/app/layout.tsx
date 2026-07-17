import type { Metadata } from "next";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { ensureUserAndProfile } from "@/lib/bootstrapUserProfile";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mypilotpage.com"),
  title: {
    default: "MyPilotPage",
    template: "%s | MyPilotPage",
  },
  description:
    "Build a living, recruiter-ready pilot resume powered by your logbook, with private-by-default sharing controls.",
  openGraph: {
    type: "website",
    siteName: "MyPilotPage",
    url: "https://www.mypilotpage.com",
    title: "MyPilotPage - A living pilot resume powered by your logbook",
    description:
      "Put qualifications, availability, and contact first, then support your career story with logbook-powered experience.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MyPilotPage social preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyPilotPage - A living pilot resume powered by your logbook",
    description:
      "Put qualifications, availability, and contact first, then support your career story with logbook-powered experience.",
    images: ["/opengraph-image"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  let myHandle: string | null = null;
  if (userId) {
    const clerkUser = await currentUser();
    const { profile } = await ensureUserAndProfile(userId, clerkUser);
    myHandle = profile.handle;
  }

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased bg-[var(--bg)] text-[var(--text)]">
          <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in srgb,var(--panel) 85%,transparent)] backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
              <Link href="/" className="inline-flex items-center gap-2.5 text-base font-semibold tracking-tight text-[var(--text)] sm:text-lg">
                <span className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--accent)_38%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_12%,var(--panel))]" aria-hidden="true">
                  <span className="h-px w-4 -rotate-45 bg-[var(--accent)]" />
                  <span className="absolute h-1.5 w-1.5 rounded-full border border-[var(--accent)] bg-[var(--panel)]" />
                </span>
                MyPilotPage
              </Link>

              <nav className="hidden items-center gap-2 text-sm font-semibold text-[var(--text)] md:flex">
                <Link
                  href="/"
                  className="rounded-full px-4 py-2 transition hover:bg-[var(--panel-muted)] hover:text-[var(--text-strong)]"
                >
                  Home
                </Link>
                <Link
                  href="/p/demo"
                  className="rounded-full px-4 py-2 transition hover:bg-[var(--panel-muted)] hover:text-[var(--text-strong)]"
                >
                  Demo
                </Link>
                <SignedOut>
                  <Link
                    href="/pricing"
                    className="rounded-full px-4 py-2 transition hover:bg-[var(--panel-muted)] hover:text-[var(--text-strong)]"
                  >
                    Pricing
                  </Link>
                </SignedOut>
                <SignedIn>
                  {myHandle ? (
                    <Link
                      href={`/p/${myHandle}`}
                      className="rounded-full px-4 py-2 transition hover:bg-[var(--panel-muted)] hover:text-[var(--text-strong)]"
                    >
                      My Page
                    </Link>
                  ) : (
                    <span className="rounded-full px-4 py-2 text-[var(--muted-2)] opacity-60">My Page</span>
                  )}
                </SignedIn>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="rounded-full px-4 py-2 transition hover:bg-[var(--panel-muted)] hover:text-[var(--text-strong)]"
                  >
                    Dashboard
                  </Link>
                </SignedIn>
                <Link
                  href="/contact"
                  className="rounded-full px-4 py-2 transition hover:bg-[var(--panel-muted)] hover:text-[var(--text-strong)]"
                >
                  Contact
                </Link>
              </nav>

              <div className="flex items-center gap-2 sm:gap-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] transition hover:bg-[var(--panel-muted)] hover:text-[var(--text-strong)] sm:px-4 sm:py-2 sm:text-sm">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-text)] transition hover:brightness-90 sm:px-4 sm:py-2 sm:text-sm">
                      Sign up
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton appearance={{ elements: { userButtonAvatarBox: "ring-2 ring-[var(--accent)]" } }} />
                </SignedIn>

                <details className="group relative md:hidden">
                  <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] transition hover:bg-[var(--panel-muted)]">
                    <span className="text-lg leading-none">☰</span>
                  </summary>
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-2 shadow-xl">
                    <Link href="/" className="block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-[var(--panel-muted)]">
                      Home
                    </Link>
                    <Link href="/p/demo" className="block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-[var(--panel-muted)]">
                      Demo
                    </Link>
                    <Link href="/contact" className="block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-[var(--panel-muted)]">
                      Contact
                    </Link>
                    <SignedOut>
                      <Link href="/pricing" className="block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-[var(--panel-muted)]">
                        Pricing
                      </Link>
                    </SignedOut>
                    <SignedIn>
                      {myHandle ? (
                        <Link href={`/p/${myHandle}`} className="block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-[var(--panel-muted)]">
                          My Page
                        </Link>
                      ) : (
                        <span className="block rounded-xl px-3 py-2 text-sm font-semibold text-[var(--muted-2)] opacity-60">
                          My Page
                        </span>
                      )}
                    </SignedIn>
                    <SignedIn>
                      <Link href="/dashboard" className="block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-[var(--panel-muted)]">
                        Dashboard
                      </Link>
                    </SignedIn>
                  </div>
                </details>
              </div>
            </div>
          </header>
          {children}
          <footer className="border-t border-[var(--border)] bg-[color-mix(in srgb,var(--panel) 85%,transparent)]">
            <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between lg:px-8">
              <div>
                <p className="font-semibold text-[var(--text)]">MyPilotPage</p>
                <p className="mt-1 text-xs">A living pilot resume, powered by your logbook.</p>
              </div>
              <div className="flex flex-wrap gap-5 text-xs font-semibold">
                <Link href="/" className="hover:text-[var(--text-strong)]">Home</Link>
                <Link href="/pricing" className="hover:text-[var(--text-strong)]">Pricing</Link>
                <Link href="/privacy" className="hover:text-[var(--text-strong)]">Privacy</Link>
                <Link href="/terms" className="hover:text-[var(--text-strong)]">Terms</Link>
                <Link href="/contact" className="hover:text-[var(--text-strong)]">Contact</Link>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
