import Link from "next/link";
import { LEGAL_META } from "@/constants/legal";

export function Footer() {
  return (
    <footer className="sticky bottom-0 z-30 mt-auto bg-gradient-to-t from-black/70 via-black/30 to-transparent pb-3 pt-6 text-base text-zinc-400">
      {/* Soft fading horizon line matching the header */}
      <div className="mx-auto mb-3 h-px w-full max-w-3xl bg-gradient-to-r from-transparent via-amber-300/25 to-transparent" />

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span>&copy; {LEGAL_META.COPYRIGHT}</span>
          <span className="text-amber-300/40" aria-hidden="true">
            ·
          </span>
          <a
            href={LEGAL_META.REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-amber-200"
          >
            Author: {LEGAL_META.AUTHOR_HANDLE}
          </a>
        </div>

        <nav className="flex flex-wrap items-center gap-5">
          <Link href="/privacy" className="transition hover:text-amber-200">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition hover:text-amber-200">
            Terms of Use
          </Link>
        </nav>
      </div>
    </footer>
  );
}