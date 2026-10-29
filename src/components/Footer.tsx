import Link from "next/link";
import { LEGAL_META } from "@/constants/legal";

export function Footer() {
  return (
    <footer className="sticky bottom-0 z-30 mt-auto border-t border-zinc-800/80 bg-zinc-950/95 py-3 text-xs text-zinc-400 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div>
          <span>&copy; {LEGAL_META.COPYRIGHT}</span>
          <a
            href={LEGAL_META.REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-zinc-100"
          >
            Created by {LEGAL_META.AUTHOR_HANDLE}
          </a>
        </div>

        <nav className="flex flex-wrap items-center gap-5">
          <Link href="/privacy" className="transition hover:text-zinc-100">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition hover:text-zinc-100">
            Terms of Use
          </Link>
        </nav>
      </div>
    </footer>
  );
}