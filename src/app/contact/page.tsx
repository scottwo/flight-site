export default function Contact() {
  return (
    <div className="min-h-screen bg-[#eaf1f8] text-[#0b1f33]">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-16">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5d7995]">
            Contact
          </p>
          <h1 className="text-4xl font-semibold text-[#0b1f33] sm:text-5xl">
            Schedule a conversation
          </h1>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6 rounded-3xl border border-[#d4e0ec] bg-white p-8 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[#0b1f33]">Get in touch</h2>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0b1f33]">Name</label>
                <input
                  className="mt-1 w-full rounded-xl border border-[#9cb6cf] bg-white px-3 py-2 text-sm text-[#0b1f33] shadow-sm transition focus:border-[#1f4b71] focus:outline-none focus:ring-0"
                  placeholder="Your name"
                  type="text"
                  name="name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0b1f33]">Email</label>
                <input
                  className="mt-1 w-full rounded-xl border border-[#9cb6cf] bg-white px-3 py-2 text-sm text-[#0b1f33] shadow-sm transition focus:border-[#1f4b71] focus:outline-none focus:ring-0"
                  placeholder="you@example.com"
                  type="email"
                  name="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0b1f33]">Message</label>
                <textarea
                  className="mt-1 h-28 w-full rounded-xl border border-[#9cb6cf] bg-white px-3 py-2 text-sm text-[#0b1f33] shadow-sm transition focus:border-[#1f4b71] focus:outline-none focus:ring-0"
                  placeholder="Share the role, timeline, and how to reach you."
                  name="message"
                />
              </div>
              <button
                className="w-full rounded-full bg-[#1f4b71] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#163552] hover:shadow"
                type="button"
              >
                Send message (placeholder)
              </button>
            </form>
          </div>

          <div className="space-y-4 rounded-3xl border border-[#d4e0ec] bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#0b1f33]">Direct contact</h2>
            <div className="space-y-3 text-sm text-[#35506c]">
              <p className="font-semibold text-[#0b1f33]">Email</p>
              <p>scott.w.ogden@gmail.com</p>
              <p className="font-semibold text-[#0b1f33]">Phone</p>
              <p>(503) 703-4208</p>
              <p className="font-semibold text-[#0b1f33]">Home base</p>
              <p>South Jordan, UT (willing to relocate)</p>
            </div>

            <div className="rounded-2xl bg-[#f3f7fc] p-4 text-sm text-[#35506c]">
              <p className="font-semibold text-[#0b1f33]">Availability</p>
              <p className="mt-1">Open for interviews and sim evals this month.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
