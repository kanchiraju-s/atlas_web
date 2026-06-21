import Link from 'next/link';

const TOPICS = [
  'Solo travel in Japan', 'Learning to code at 30', 'Intermittent fasting',
  'Van life', 'Remote work', 'Minimalism', 'Psychedelics',
  'Learning guitar', 'Moving abroad', 'Stoicism',
];

export default function LandingPage() {
  return (
    <div className="flex flex-col items-start gap-16 py-16">
      {/* Hero */}
      <section className="flex flex-col gap-6 max-w-2xl">
        <h1 className="text-6xl font-black tracking-tight text-[#f8fafc] leading-tight">
          Every topic becomes<br />a destination.
        </h1>
        <p className="text-[#94a3b8] text-lg leading-relaxed">
          Google helps you find information.<br />
          Reddit helps you find discussions.<br />
          <span className="text-[#f8fafc]">Atlas helps you discover accumulated human experiences.</span>
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            href="/feed"
            className="bg-[#38bdf8] text-[#0f172a] px-6 py-3 rounded-xl font-bold text-base hover:bg-[#38bdf8]/90 transition-colors"
          >
            Explore Atlas
          </Link>
          <Link
            href="/auth"
            className="border border-[#1e293b] text-[#f8fafc] px-6 py-3 rounded-xl font-semibold text-base hover:bg-[#111827] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Topics */}
      <section className="flex flex-col gap-4 w-full">
        <p className="text-[#94a3b8] text-sm uppercase tracking-widest font-semibold">
          People are exploring
        </p>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <Link
              key={t}
              href={`/search?q=${encodeURIComponent(t)}`}
              className="border border-[#1e293b] text-[#cbd5e1] px-4 py-2 rounded-full text-sm hover:border-[#38bdf8]/40 hover:text-[#f8fafc] transition-colors"
            >
              {t}
            </Link>
          ))}
        </div>
      </section>

      {/* Manifesto */}
      <section className="border-l-2 border-[#38bdf8] pl-6 max-w-xl">
        <p className="text-[#cbd5e1] text-base leading-relaxed">
          Most knowledge lives in people's heads. It never gets written down.
          Atlas is where it does — one drop at a time.
        </p>
      </section>

      <footer className="text-[#94a3b8] text-sm pt-8 border-t border-[#1e293b] w-full">
        Atlas Alpha · 500 explorer spots · Free forever
      </footer>
    </div>
  );
}
