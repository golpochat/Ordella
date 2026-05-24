type SectionProps = {
  id?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'muted' | 'brand';
};

const variantClasses = {
  default: 'bg-background',
  muted: 'bg-muted/40',
  brand: 'bg-brand text-brand-foreground',
};

export function Section({ id, title, subtitle, children, className = '', variant = 'default' }: SectionProps) {
  return (
    <section id={id} className={`py-16 md:py-24 ${variantClasses[variant]} ${className}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {(title || subtitle) && (
          <div className="mb-10 max-w-2xl">
            {title ? (
              <h2 className={`text-3xl font-bold tracking-tight md:text-4xl ${variant === 'brand' ? '' : ''}`}>
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p
                className={`mt-3 text-lg ${variant === 'brand' ? 'text-brand-foreground/90' : 'text-muted-foreground'}`}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
