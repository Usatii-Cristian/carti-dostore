import type { Metadata } from "next";
import { Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Recomandări de lectură, noutăți editoriale și povești din lumea cărților.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-soft text-terracotta">
        <Newspaper className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="mt-5 font-serif text-3xl font-semibold text-ink sm:text-4xl">Blog</h1>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-soft">
        Pregătim recomandări de lectură, interviuri și noutăți din lumea cărților. Revino
        curând — primele articole apar în curând.
      </p>
    </div>
  );
}
