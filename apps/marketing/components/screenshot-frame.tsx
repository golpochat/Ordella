import Image from 'next/image';
import { cn } from '@/lib/cn';
import {
  getScreenshot,
  resolveScreenshotId,
  type ScreenshotFrameType,
  type ScreenshotId,
} from '@/lib/screenshots';

/** @deprecated Use {@link ScreenshotId} via the `image` prop */
export type ScreenshotVariant =
  | 'dashboard'
  | 'pos'
  | 'mobile'
  | 'kds'
  | 'storefront'
  | 'architecture';

type ScreenshotFrameProps = {
  /** Preferred: explicit screenshot asset id */
  image?: ScreenshotId;
  /** Legacy alias — mapped via VARIANT_TO_SCREENSHOT */
  variant?: ScreenshotVariant;
  title: string;
  caption?: string;
  className?: string;
  priority?: boolean;
};

function BrowserChrome({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-brand">
      <div className="flex shrink-0 items-center gap-2 border-b border-border/80 bg-gray-light px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" aria-hidden />
        <span className="ml-2 truncate text-xs font-medium text-slate">{label}</span>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden bg-gray-light">{children}</div>
    </div>
  );
}

function DeviceChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex h-full w-full max-w-[280px] flex-col overflow-hidden rounded-[1.75rem] border-[3px] border-navy/10 bg-card shadow-elevated sm:max-w-[320px]">
      <div className="h-5 shrink-0 bg-navy/5" aria-hidden />
      <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

function ScreenshotImage({
  meta,
  priority,
  className,
}: {
  meta: ReturnType<typeof getScreenshot>;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={meta.src}
      alt={meta.alt}
      width={meta.width}
      height={meta.height}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      className={cn('h-full w-full object-cover object-top', className)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
    />
  );
}

function frameForType(type: ScreenshotFrameType): 'browser' | 'device' {
  return type;
}

export function ScreenshotFrame({
  image,
  variant,
  title,
  caption,
  className,
  priority = false,
}: ScreenshotFrameProps) {
  const screenshotId = image ?? resolveScreenshotId(variant ?? 'dashboard');
  const meta = getScreenshot(screenshotId);
  const frame = frameForType(meta.frame);
  const isDevice = frame === 'device';
  const aspect = isDevice ? 'aspect-[4/5] max-w-sm mx-auto' : 'aspect-[4/3] sm:aspect-video';

  const chromeLabel = 'Bella Market · demo';

  return (
    <figure className={cn('w-full', className)}>
      <div className={cn('overflow-hidden rounded-2xl', aspect)}>
        {isDevice ? (
          <div className="flex h-full items-center justify-center bg-gradient-to-b from-gray-light to-background p-4 sm:p-6">
            <DeviceChrome>
              <ScreenshotImage meta={meta} priority={priority} />
            </DeviceChrome>
          </div>
        ) : (
          <BrowserChrome label={chromeLabel}>
            <ScreenshotImage meta={meta} priority={priority} />
          </BrowserChrome>
        )}
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center text-caption">{caption}</figcaption>
      ) : null}
      <span className="sr-only">{title}</span>
    </figure>
  );
}
