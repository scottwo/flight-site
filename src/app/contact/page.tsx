import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact | MyPilotPage",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-2)]">Contact</p>
          <h1 className="text-3xl font-semibold text-[var(--text)]">Send a message</h1>
          <p className="text-sm text-[var(--muted)]">
            Send feedback, report import issues, or ask for help. You can attach a screenshot.
          </p>
        </header>
        <ContactForm />
      </div>
    </main>
  );
}
