import { cn } from '@/lib/cn';

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center';
};

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
  align = 'left',
}: PageHeroProps) {
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? <p className="text-eyebrow">{eyebrow}</p> : null}
      <h1 className={cn('text-h1 mt-2', eyebrow && 'mt-3')}>{title}</h1>
      <p className="text-body-lg mt-4">{description}</p>
      {children ? (
        <div
          className={cn(
            'mt-8 flex flex-wrap gap-3',
            align === 'center' ? 'justify-center' : 'justify-start',
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
