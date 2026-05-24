import { FeatureCard } from './feature-card';
import { ScreenshotFrame } from './screenshot-frame';
import type { FeaturePillar } from '@/lib/features-data';
import { cn } from '@/lib/cn';

type PillarsProps = {
  pillars: FeaturePillar[];
  showScreenshots?: boolean;
  className?: string;
};

export function Pillars({ pillars, showScreenshots = true, className }: PillarsProps) {
  return (
    <div
      className={cn(
        'grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10',
        className,
      )}
    >
      {pillars.map((pillar) => (
        <article key={pillar.id} className="flex min-h-0 flex-col gap-5">
          <FeatureCard
            title={pillar.title}
            description={pillar.description}
            icon={pillar.icon}
            className="flex-1"
          />
          {showScreenshots ? (
            <ScreenshotFrame
              image={pillar.screenshotImage}
              title={pillar.screenshotLabel}
              className="mt-auto"
            />
          ) : null}
        </article>
      ))}
    </div>
  );
}
