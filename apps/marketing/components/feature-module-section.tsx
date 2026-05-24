import Link from 'next/link';
import { Button } from '@shared-ui';
import { Check } from 'lucide-react';
import { ScreenshotFrame } from './screenshot-frame';
import { Section } from './section';
import type { FeatureModule } from '@/lib/features-data';

type FeatureModuleSectionProps = {
  module: FeatureModule;
  reversed?: boolean;
};

export function FeatureModuleSection({ module: mod, reversed }: FeatureModuleSectionProps) {
  return (
    <Section
      id={mod.id}
      variant={reversed ? 'muted' : 'default'}
      title={mod.title}
      subtitle={mod.headline}
    >
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className={reversed ? 'lg:order-2' : undefined}>
          <ul className="space-y-3">
            {mod.bullets.map((b) => (
              <li key={b} className="flex gap-3 text-body">
                <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
          <Button asChild variant="link" className="mt-6 h-auto px-0">
            <Link href={mod.docPath}>Read the guide →</Link>
          </Button>
        </div>
        <div className={reversed ? 'lg:order-1' : undefined}>
          <ScreenshotFrame image={mod.screenshotImage} title={mod.screenshotLabel} />
        </div>
      </div>
    </Section>
  );
}
