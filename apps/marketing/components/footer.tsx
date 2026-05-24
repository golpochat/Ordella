import Link from 'next/link';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { Container } from './container';
import { Logo } from './logo';
import { CtaButton } from './cta-button';
import { DOC_CATEGORIES } from '@/lib/docs-categories';
import { siteConfig } from '@/lib/site';

const productLinks = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact sales' },
];

const legalLinks = [
  { href: '/legal/privacy', label: 'Privacy' },
  { href: '/legal/terms', label: 'Terms' },
];

const social = [
  { href: 'https://twitter.com', label: 'Twitter', icon: Twitter },
  { href: 'https://linkedin.com', label: 'LinkedIn', icon: Linkedin },
  { href: 'https://github.com', label: 'GitHub', icon: Github },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-gray-light">
      <Container className="py-14 md:py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-xs text-body">{siteConfig.description}</p>
            <div className="mt-6">
              <CtaButton size="sm" utmCampaign="landing" utmContent="footer">
                Start free trial
              </CtaButton>
            </div>
            <div className="mt-6 flex gap-3">
              {social.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-slate shadow-brand transition-colors hover:border-primary/30 hover:text-primary"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-8">
            <div>
              <p className="text-sm font-semibold text-navy">Product</p>
              <ul className="mt-4 space-y-3">
                {productLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate transition-colors hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-navy">Documentation</p>
              <ul className="mt-4 space-y-3">
                {DOC_CATEGORIES.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/docs/${cat.id}`}
                      className="text-sm text-slate transition-colors hover:text-primary"
                    >
                      {cat.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-navy">Legal</p>
              <ul className="mt-4 space-y-3">
                {legalLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate transition-colors hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
      <div className="border-t border-border/80 py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
          <p className="text-caption">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-caption">Built for modern multi-channel retail operators.</p>
        </Container>
      </div>
    </footer>
  );
}
