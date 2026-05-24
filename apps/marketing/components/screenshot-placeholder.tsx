type ScreenshotPlaceholderProps = {
  label: string;
  className?: string;
  aspect?: 'video' | 'square' | 'phone';
};

const aspectClasses = {
  video: 'aspect-video',
  square: 'aspect-square',
  phone: 'aspect-[9/19] max-w-xs mx-auto',
};

export function ScreenshotPlaceholder({
  label,
  className = '',
  aspect = 'video',
}: ScreenshotPlaceholderProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-gradient-to-br from-brand-muted via-background to-muted shadow-lg ${aspectClasses[aspect]} ${className}`}
      role="img"
      aria-label={label}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/50 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          <span className="ml-2 text-xs text-muted-foreground">Bella Kitchen — demo</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">Product screenshot placeholder</p>
        </div>
      </div>
    </div>
  );
}
