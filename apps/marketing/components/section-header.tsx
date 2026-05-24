import { cn } from '@/lib/cn';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
  titleAs?: 'h1' | 'h2';
  inverted?: boolean;
};

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className,
  titleAs: TitleTag = 'h2',
  inverted = false,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        'mb-10 md:mb-12 lg:mb-14',
        align === 'center' && 'mx-auto max-w-3xl text-center',
        className,
      )}
    >
      {eyebrow ? (
        <p className={cn('text-eyebrow', inverted && 'text-primary-foreground/80')}>{eyebrow}</p>
      ) : null}
      <TitleTag
        className={cn(
          'text-h2 mt-2',
          eyebrow && 'mt-3',
          inverted && 'text-inherit',
        )}
      >
        {title}
      </TitleTag>
      {subtitle ? (
        <p
          className={cn(
            'text-body-lg mt-4',
            inverted && 'text-primary-foreground/90',
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
