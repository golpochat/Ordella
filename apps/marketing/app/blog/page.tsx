import { BlogCard } from '@/components/blog-card';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/section';
import { getAllBlogPosts, getFeaturedBlogPosts } from '@/lib/blog';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Blog',
  description:
    'Retail and food business technology — POS, online ordering, fulfillment, delivery, and multi-location operations.',
  path: '/blog',
});

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();
  const featured = getFeaturedBlogPosts();
  const featuredSlugs = new Set(featured.map((post) => post.slug));
  const rest = posts.filter((post) => !featuredSlugs.has(post.slug));

  return (
    <Section className="pt-6 sm:pt-10" size="sm">
      <PageHero
        eyebrow="Blog"
        title="Insights for modern retail and food operators"
        description="Guides on catalogs, fulfillment workflows, and unifying in-store, pickup, and delivery without vendor sprawl."
      />

      {featured.length > 0 ? (
        <section className="mt-12 lg:mt-14" aria-labelledby="featured-posts-heading">
          <h2 id="featured-posts-heading" className="text-h3">
            Featured
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 sm:gap-8">
            {featured.map((post) => (
              <li key={post.slug}>
                <BlogCard post={post} featured />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12 lg:mt-14" aria-labelledby="all-posts-heading">
        <h2 id="all-posts-heading" className="text-h3">
          {featured.length > 0 ? 'All posts' : 'Latest posts'}
        </h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {(featured.length > 0 ? rest : posts).map((post) => (
            <li key={post.slug}>
              <BlogCard post={post} />
            </li>
          ))}
        </ul>
      </section>
    </Section>
  );
}
