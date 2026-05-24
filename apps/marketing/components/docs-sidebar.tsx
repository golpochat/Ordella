import Link from 'next/link';
import { docCategories } from '@/lib/docs-nav';

type DocsSidebarProps = {
  activeCategory?: string;
  activeSlug?: string;
};

export function DocsSidebar({ activeCategory, activeSlug }: DocsSidebarProps) {
  return (
    <aside className="w-full shrink-0 md:w-56">
      <nav className="space-y-6" aria-label="Documentation">
        {docCategories.map((cat) => (
          <div key={cat.slug}>
            <Link
              href={`/docs/${cat.slug}`}
              className={`text-sm font-semibold hover:text-primary ${
                activeCategory === cat.slug && !activeSlug ? 'text-primary' : 'text-foreground'
              }`}
            >
              {cat.title}
            </Link>
            <ul className="mt-2 space-y-1 border-l border-border pl-3">
              {cat.articles.map((article) => {
                const href = `/docs/${cat.slug}/${article.slug}`;
                const active = activeCategory === cat.slug && activeSlug === article.slug;
                return (
                  <li key={article.slug}>
                    <Link
                      href={href}
                      className={`block py-1 text-sm ${active ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {article.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
