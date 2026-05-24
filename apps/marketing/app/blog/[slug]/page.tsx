import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CtaButton } from '@/components/cta-button';
import { Markdown } from '@/components/markdown';
import { Section } from '@/components/section';
import { createMetadata } from '@/lib/metadata';
import { getAllBlogSlugs, getBlogPost } from '@/lib/content';

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props) {
  const post = getBlogPost(params.slug);
  if (!post) return {};
  return createMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${params.slug}`,
  });
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  return (
    <Section className="pt-12">
      <article className="mx-auto max-w-3xl">
        <time className="text-sm text-muted-foreground" dateTime={post.date}>
          {post.date}
        </time>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">{post.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{post.description}</p>
        <div className="mt-10">
          <Markdown content={post.body} />
        </div>
        <div className="mt-12 rounded-lg border border-border bg-muted/40 p-6">
          <p className="font-semibold">Run every order channel from one platform</p>
          <p className="mt-1 text-sm text-muted-foreground">Start your free Ordella tenant today.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <CtaButton utmContent={`blog_${params.slug}`}>Start free trial</CtaButton>
            <Link href="/pricing" className="text-sm font-medium text-primary hover:underline self-center">
              View pricing
            </Link>
          </div>
        </div>
      </article>
    </Section>
  );
}
