import Link from 'next/link';
import { Badge } from '@shared-ui';
import { cn } from '@/lib/cn';
import { formatReadingTime } from '@/lib/reading-time';
import type { BlogPostMeta } from '@/lib/blog';

type BlogCardProps = {
  post: BlogPostMeta;
  className?: string;
  featured?: boolean;
};

export function BlogCard({ post, className, featured }: BlogCardProps) {
  const showFeatured = featured ?? post.featured;

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow duration-fast ease-default hover:shadow-md sm:p-7',
        showFeatured && 'border-primary/30 ring-1 ring-primary/10',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-caption">
        <time dateTime={post.date}>{post.date}</time>
        <span aria-hidden>·</span>
        <span>{formatReadingTime(post.readingTimeMinutes)}</span>
        {showFeatured ? <Badge>Featured</Badge> : null}
        {post.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
      <h2 className="text-h4 mt-4">
        <Link href={`/blog/${post.slug}`} className="hover:text-primary">
          {post.title}
        </Link>
      </h2>
      <p className="text-body mt-3 flex-1">{post.description}</p>
      <Link
        href={`/blog/${post.slug}`}
        className="mt-5 inline-block text-sm font-semibold text-primary hover:underline"
      >
        Read article →
      </Link>
    </article>
  );
}
