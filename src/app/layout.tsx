import type { Metadata } from "next";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import prisma from "@/lib/prisma";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyPilotPage",
  description: "Create a shareable pilot profile with stats, maps, and currency—powered by your logbook.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  let myHandle: string | null = null;
  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        profile: {
          select: { handle: true },
        },
      },
    });
    myHandle = dbUser?.profile?.handle ?? null;
  }

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased bg-[var(--bg)] text-[var(--text)]">
          <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in srgb,var(--panel) 85%,transparent)] backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
              <Link href="/" className="text-base font-semibold text-[var(--text)] sm:text-lg">
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
          <footer className="mt-12 border-t border-[var(--border)] bg-[color-mix(in srgb,var(--panel) 85%,transparent)]">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-6 text-sm text-[var(--muted)]">
              <Link href="/" className="hover:text-[var(--text-strong)]">
                Home
              </Link>
              <span className="text-[var(--muted-2)]">•</span>
              <Link href="/pricing" className="hover:text-[var(--text-strong)]">
                Pricing
              </Link>
              <span className="text-[var(--muted-2)]">•</span>
              <Link href="/privacy" className="hover:text-[var(--text-strong)]">
                Privacy
              </Link>
              <span className="text-[var(--muted-2)]">•</span>
              <Link href="/terms" className="hover:text-[var(--text-strong)]">
                Terms
              </Link>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
