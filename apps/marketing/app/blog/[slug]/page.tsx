import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@shared-ui';
import { PostNavigation } from '@/components/blog/post-navigation';
import { CtaButton } from '@/components/cta-button';
import { MdxContent } from '@/components/docs/mdx-content';
import { Section } from '@/components/section';
import { getAdjacentBlogPosts, getAllBlogSlugs, getBlogPostSource } from '@/lib/blog';
import { createBlogPostMetadata } from '@/lib/metadata';
import { formatReadingTime } from '@/lib/reading-time';

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props) {
  const post = getBlogPostSource(params.slug);
  if (!post) return {};

  const { meta } = post;
  return createBlogPostMetadata({
    title: meta.title,
    description: meta.description,
    path: `/blog/${meta.slug}`,
    publishedTime: meta.date,
    tags: meta.tags,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const post = getBlogPostSource(params.slug);
  if (!post) notFound();

  const { meta, source } = post;
  const { newer, older } = getAdjacentBlogPosts(meta.slug);

  return (
    <Section className="pt-6 sm:pt-10" size="sm">
      <article className="mx-auto max-w-prose">
        <header className="border-b border-border pb-8">
          <div className="flex flex-wrap items-center gap-2 text-caption">
            <time dateTime={meta.date}>{meta.date}</time>
            <span aria-hidden>·</span>
            <span>{formatReadingTime(meta.readingTimeMinutes)}</span>
            {meta.featured ? <Badge>Featured</Badge> : null}
            {meta.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-h1 mt-4">{meta.title}</h1>
          <p className="text-body-lg mt-4 text-slate">{meta.description}</p>
        </header>
        <div className="mt-10">
          <MdxContent source={source} className="blog-mdx" />
        </div>

        <PostNavigation newer={newer} older={older} />

        <aside className="mt-12 rounded-2xl border border-border bg-gray-light p-6 sm:p-8">
          <p className="text-h4">Run every order channel from one platform</p>
          <p className="text-body mt-2">Start your free Ordella tenant today.</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <CtaButton utmCampaign="blog" utmContent={`blog_${params.slug}`}>
              Start free trial
            </CtaButton>
            <Link href="/pricing" className="text-sm font-semibold text-primary hover:underline">
              View pricing
            </Link>
          </div>
        </aside>
      </article>
    </Section>
  );
}
