'use client';

import { useId, useState } from 'react';
import { Button, Card, Icon } from '@shared-ui';
import { cn } from '@/lib/cn';

export type FaqItem = { q: string; a: string };

type FaqAccordionProps = {
  items: FaqItem[];
  className?: string;
};

export function FaqAccordion({ items, className }: FaqAccordionProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Card
      className={cn(
        'mx-auto w-full max-w-2xl divide-y divide-border shadow-sm',
        className,
      )}
      data-ods-elevation="sm"
    >
      {items.map((faq, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <div key={faq.q}>
            <h3>
              <Button
                id={buttonId}
                type="button"
                variant="ghost"
                className="flex h-auto w-full items-center justify-between gap-4 rounded-none px-5 py-4 text-left text-base font-semibold text-navy transition-colors hover:bg-gray-light focus-visible:bg-gray-light sm:px-6 sm:py-5"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                {faq.q}
                <Icon
                  name="chevron-down"
                  size="md"
                  className={cn('shrink-0 text-slate transition-transform', isOpen && 'rotate-180')}
                  decorative
                />
              </Button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className={cn(!isOpen && 'hidden')}
            >
              <p className="px-5 pb-5 text-body sm:px-6 sm:pb-6">{faq.a}</p>
            </div>
          </div>
        );
      })}
    </Card>
  );
}
