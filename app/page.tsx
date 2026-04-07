export default function Home() {
  return (
    <main className="bg-[#0d0d0d] text-white min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[90vh] flex flex-col items-center justify-center text-center px-6">
        {/* streak background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(120,60,0,0.35) 0%, transparent 70%), radial-gradient(ellipse 60% 80% at 60% 30%, rgba(180,140,20,0.18) 0%, transparent 60%)",
          }}
        />
        {/* streak lines */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(120deg, transparent, transparent 60px, rgba(255,220,80,0.06) 61px, rgba(255,220,80,0.06) 62px)",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-6xl sm:text-7xl font-extrabold leading-tight mb-4">
            Focus Above
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-300">
              the Clouds
            </span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-md mx-auto mb-8">
            Transform your study sessions into a symbolic journey. Fly from city
            to city as you traverse the deep, quiet landscapes of your own
            concentration.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="/journey"
              className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 transition-colors font-semibold text-sm"
            >
              Start Your Journey
            </a>
          </div>
        </div>
      </section>

      {/* ── 3-column steps ── */}
      <section className="max-w-5xl mx-auto px-6 py-24 grid grid-cols-1 sm:grid-cols-3 gap-12">
        {[
          {
            icon: (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            ),
            title: "Select Your Flight",
            body: "Choose your destination—a focus task or project. Each session is a ticket to a new mental landscape.",
          },
          {
            icon: (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            ),
            title: "Enter the Sanctuary",
            body: "Immerse yourself in a distraction-free dark environment. The clouds fade as your work takes center stage.",
          },
          {
            icon: (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            ),
            title: "Touchdown",
            body: "Land at your destination with a completed task and a logged journey. Review your progress over time.",
          },
        ].map((item) => (
          <div key={item.title}>
            <div className="text-purple-400 mb-3">{item.icon}</div>
            <h3 className="font-bold text-lg mb-2">{item.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{item.body}</p>
          </div>
        ))}
      </section>

      {/* ── Dark Mode section ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="relative rounded-2xl bg-[#141414] border border-gray-800 overflow-hidden flex flex-col md:flex-row gap-8 p-10">
          {/* left */}
          <div className="flex-1">
            <span className="text-xs font-semibold tracking-widest text-purple-400 uppercase mb-4 inline-block border border-purple-800 rounded-full px-3 py-1">
              Deep Immersion
            </span>
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              The Dark Mode<br />You Deserve.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Designed for long nights and deep work. No harsh whites, no
              distracting borders. Only tonal topography and the subtle glow of
              neon purple to guide your focus.
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              {["Eye-strain reduction system", "Minimalist glassmorphic interface", "Zero-notification zones"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* right — timer card */}
          <div className="flex-1 flex flex-col items-end justify-center gap-4">
            <div className="w-full max-w-xs rounded-xl bg-[#1a1a1a] border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" /></svg>
                  Tokyo Flight
                </span>
              </div>
              <div className="text-center">
                <p className="text-5xl font-mono font-bold text-purple-400 mb-1">25:00</p>
                <p className="text-xs tracking-widest text-gray-500 uppercase">Sanctuary Active</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature cards grid ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Journey Log — tall left card */}
          <div className="rounded-2xl bg-[#141414] border border-gray-800 p-8 flex flex-col justify-end min-h-[320px]"
            style={{ background: "linear-gradient(160deg, #1a1a2e 0%, #141414 100%)" }}>
            <h3 className="text-2xl font-bold mb-2">Journey Log</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Visualize every hour spent in focus as a path across a dark,
              beautiful digital earth.
            </p>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Atmospheric Audio */}
            <div className="rounded-2xl bg-[#141414] border border-gray-800 p-6">
              <div className="text-purple-400 mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
                </svg>
              </div>
              <h3 className="font-bold mb-1">Atmospheric Audio</h3>
              <p className="text-gray-400 text-sm">
                Procedural engine noise and high-altitude soundscapes to drown out the world.
              </p>
            </div>

            {/* Bottom two small cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#141414] border border-gray-800 p-6 flex flex-col justify-end">
                <p className="text-3xl font-bold text-white mb-1">99%</p>
                <p className="text-xs tracking-widest text-gray-500 uppercase">Flow State Achieved</p>
              </div>
              <div className="rounded-2xl bg-[#141414] border border-gray-800 p-6 flex flex-col justify-end">
                <p className="text-2xl font-bold text-white mb-1">Join</p>
                <p className="text-xs text-purple-400">13K Students Active</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="text-center py-28 px-6">
        <h2 className="text-5xl sm:text-6xl font-extrabold mb-4">Ready to ascend?</h2>
        <p className="text-gray-400 text-base mb-8 max-w-md mx-auto">
          Leave the distractions of the surface behind. Your sanctuary is waiting in the clouds.
        </p>
        <a
          href="/journey"
          className="inline-block px-8 py-4 rounded-xl bg-purple-500 hover:bg-purple-400 transition-colors font-semibold text-sm"
        >
          Join the Sanctuary
        </a>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800 px-6 py-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <span className="font-semibold text-white text-sm">Flightime</span>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact", "Twitter"].map((l) => (
              <a key={l} href="#" className="hover:text-gray-300 transition-colors">{l}</a>
            ))}
          </div>
          <span>© 2024 Flightime. The Midnight Sanctuary.</span>
        </div>
      </footer>

    </main>
  );
}
