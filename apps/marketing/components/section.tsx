import { cn } from '@/lib/cn';
import { Container } from './container';
import { SectionHeader } from './section-header';

type SectionProps = {
  id?: string;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  variant?: 'default' | 'muted' | 'brand' | 'dark';
  size?: 'default' | 'sm' | 'lg';
  align?: 'left' | 'center';
  titleAs?: 'h1' | 'h2';
};

const variantClasses = {
  default: 'bg-background',
  muted: 'border-y border-border/60 bg-gray-light',
  brand: 'bg-primary text-primary-foreground',
  dark: 'bg-navy text-white',
};

const sizeClasses = {
  sm: 'py-section-sm md:py-section',
  default: 'py-section lg:py-section-lg',
  lg: 'py-section-lg lg:py-30',
};

export function Section({
  id,
  title,
  subtitle,
  eyebrow,
  children,
  className,
  containerClassName,
  variant = 'default',
  size = 'default',
  align = 'left',
  titleAs = 'h2',
}: SectionProps) {
  const isBrand = variant === 'brand' || variant === 'dark';
  const hasHeader = title || subtitle || eyebrow;

  return (
    <section id={id} className={cn(sizeClasses[size], variantClasses[variant], className)}>
      <Container className={containerClassName}>
        {hasHeader && title ? (
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            align={align}
            titleAs={titleAs}
            inverted={isBrand}
            className={cn(variant === 'dark' && '[&_h2]:text-white [&_p]:text-white/85')}
          />
        ) : null}
        {children}
      </Container>
    </section>
  );
}
