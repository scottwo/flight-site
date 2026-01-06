export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#eaf1f8] text-[#0b1f33]">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-12">
        <h1 className="text-3xl font-semibold text-[#0b1f33]">Terms of Service</h1>
        <p className="text-sm text-[#35506c]">
          Placeholder terms for the flight-site MVP. Use of this site is subject to updates as features roll out. Keep
          your account secure and only share your public page with trusted audiences.
        </p>
        <a href="/" className="text-sm font-semibold text-[#1f4b71] hover:underline">
          Back to home
        </a>
      </div>
    </main>
  );
}
