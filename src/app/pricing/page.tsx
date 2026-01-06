import Link from "next/link";

export const metadata = {
  title: "Pricing | MyPilotPage",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#eaf1f8] text-[#0b1f33]">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5d7995]">Pricing</p>
          <h1 className="text-3xl font-semibold text-[#0b1f33]">Free during beta</h1>
          <p className="text-sm text-[#35506c]">
            Pro features coming soon: custom domains, advanced imports, resume/headshot hosting, and more.
          </p>
        </header>

        <ul className="space-y-3 rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm text-sm text-[#35506c]">
          <li>• Free while we build out pro features</li>
          <li>• Keep your pilot page live and shareable</li>
          <li>• Coming soon: team/recruiter tools, richer snapshots, custom branding</li>
        </ul>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/sign-up"
            className="rounded-full bg-[#1f4b71] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#163552]"
          >
            Create your page
          </Link>
          <Link
            href="/p/demo"
            className="rounded-full border border-[#d4e0ec] px-4 py-2 text-sm font-semibold text-[#0f2f4b] transition hover:bg-[#e6eef7]"
          >
            View demo
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-[#35506c]">
          <Link href="/privacy" className="hover:text-[#1f4b71]">
            Privacy
          </Link>
          <span className="text-[#9cb6cf]">•</span>
          <Link href="/terms" className="hover:text-[#1f4b71]">
            Terms
          </Link>
          <span className="text-[#9cb6cf]">•</span>
          <Link href="/" className="hover:text-[#1f4b71]">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
