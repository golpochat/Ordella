import Link from 'next/link';
import { Badge } from '@shared-ui';
import { Section } from '@/components/section';
import { createMetadata } from '@/lib/metadata';
import { getAllBlogPosts } from '@/lib/content';

export const metadata = createMetadata({
  title: 'Blog',
  description: 'Restaurant technology, POS, online ordering, delivery, and multi-location operations.',
  path: '/blog',
});

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <Section className="pt-12">
      <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Guides and insights for operators modernizing in-store, online, and delivery.
      </p>
      <ul className="mt-12 space-y-8">
        {posts.map((post) => (
          <li key={post.slug} className="border-b border-border pb-8">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <time dateTime={post.date}>{post.date}</time>
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <h2 className="mt-2 text-2xl font-semibold">
              <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 text-muted-foreground">{post.description}</p>
            <Link href={`/blog/${post.slug}`} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
              Read more →
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
