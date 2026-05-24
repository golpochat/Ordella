import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { BlogPostMeta } from '@/lib/blog';

type PostNavigationProps = {
  newer: BlogPostMeta | null;
  older: BlogPostMeta | null;
};

export function PostNavigation({ newer, older }: PostNavigationProps) {
  if (!newer && !older) return null;

  return (
    <nav
      className="mt-12 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
      aria-label="Blog post navigation"
    >
      {older ? (
        <Link
          href={`/blog/${older.slug}`}
          className="group flex flex-col rounded-xl border border-border bg-card p-4 shadow-brand transition-shadow hover:shadow-elevated sm:p-5"
        >
          <span className="flex items-center gap-1 text-caption">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Older post
          </span>
          <span className="text-h4 mt-2 text-navy group-hover:text-primary">{older.title}</span>
        </Link>
      ) : (
        <div aria-hidden />
      )}
      {newer ? (
        <Link
          href={`/blog/${newer.slug}`}
          className="group flex flex-col rounded-xl border border-border bg-card p-4 text-right shadow-brand transition-shadow hover:shadow-elevated sm:col-start-2 sm:p-5"
        >
          <span className="flex items-center justify-end gap-1 text-caption">
            Newer post
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="text-h4 mt-2 text-navy group-hover:text-primary">{newer.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
