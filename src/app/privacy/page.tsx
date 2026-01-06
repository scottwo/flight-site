export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#eaf1f8] text-[#0b1f33]">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-12">
        <h1 className="text-3xl font-semibold text-[#0b1f33]">Privacy Policy</h1>
        <p className="text-sm text-[#35506c]">
          This is a placeholder policy for the MVP. Your Clerk-authenticated session protects private routes. Flight
          stats and profile data will follow the principle of least privilege and will be stored securely.
        </p>
        <a href="/" className="text-sm font-semibold text-[#1f4b71] hover:underline">
          Back to home
        </a>
      </div>
    </main>
  );
}
