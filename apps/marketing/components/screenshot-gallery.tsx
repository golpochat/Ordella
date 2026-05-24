import { ScreenshotFrame } from './screenshot-frame';
import type { ScreenshotId } from '@/lib/screenshots';
import { cn } from '@/lib/cn';

export type ScreenshotItem = {
  label: string;
  image: ScreenshotId;
  caption?: string;
};

type ScreenshotGalleryProps = {
  screens: ScreenshotItem[];
  className?: string;
};

export function ScreenshotGallery({ screens, className }: ScreenshotGalleryProps) {
  return (
    <div
      className={cn(
        'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8',
        className,
      )}
    >
      {screens.map((screen) => (
        <ScreenshotFrame
          key={screen.image}
          image={screen.image}
          title={screen.label}
          caption={screen.caption}
        />
      ))}
    </div>
  );
}
