import type { LucideIcon } from 'lucide-react';
import { Building2, Rocket, TrendingUp } from 'lucide-react';
import { ScreenshotFrame } from './screenshot-frame';
import type { ScreenshotId } from '@/lib/screenshots';
import { cn } from '@/lib/cn';

export type HowItWorksStep = {
  step: string;
  title: string;
  copy: string;
  image: ScreenshotId;
  label: string;
  icon?: LucideIcon;
};

const defaultIcons: LucideIcon[] = [Building2, Rocket, TrendingUp];

type HowItWorksProps = {
  steps: HowItWorksStep[];
  className?: string;
};

export function HowItWorks({ steps, className }: HowItWorksProps) {
  return (
    <ol className={cn('grid gap-10 md:grid-cols-3 md:gap-8 lg:gap-10', className)}>
      {steps.map((s, index) => {
        const Icon = s.icon ?? defaultIcons[index] ?? Building2;
        return (
          <li key={s.step} className="flex flex-col">
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
                aria-hidden
              >
                {s.step}
              </span>
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-card text-primary shadow-brand"
                aria-hidden
              >
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <h3 className="text-h3 mt-5">{s.title}</h3>
            <p className="text-body mt-3 flex-1">{s.copy}</p>
            <ScreenshotFrame image={s.image} title={s.label} className="mt-6" />
          </li>
        );
      })}
    </ol>
  );
}
