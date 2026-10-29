import Link from "next/link";
import { TERMS_SECTIONS } from "@/constants/legal";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="inline-block text-xs font-medium text-zinc-400 underline hover:text-zinc-100"
        >
          Back to Re:Horizon
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Terms of Use
        </h1>

        <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          {TERMS_SECTIONS.map((sec) => (
            <section key={sec.heading} className="space-y-1.5">
              <h2 className="text-sm font-semibold text-zinc-100">
                {sec.heading}
              </h2>
              <p className="text-sm leading-relaxed text-zinc-400">
                {sec.body}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}