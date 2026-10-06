"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Container } from "@/components/ui";

/**
 * If anything on a page throws while rendering in the browser, the visitor
 * gets this instead of a blank screen: the header, footer and navigation
 * keep working, and one click retries the page.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="relative flex min-h-[80svh] items-center pt-24">
      <Container>
        <p className="label text-magenta">Runtime error · gradient exploded</p>
        <h1 className="mt-6 text-display-xl text-frost">Something on this page failed to load.</h1>
        <p className="mt-6 max-w-lg text-body-l text-haze">
          It is on our side, not yours. Try again — and if it keeps happening, the rest of the site still works.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center rounded-full bg-cyan px-6 text-small font-semibold text-void"
          >
            Try again
          </button>
          <Link href="/" className="inline-flex min-h-12 items-center rounded-full border border-line-bright px-6 text-small font-semibold text-frost">
            Back to the home page
          </Link>
        </div>
      </Container>
    </section>
  );
}
