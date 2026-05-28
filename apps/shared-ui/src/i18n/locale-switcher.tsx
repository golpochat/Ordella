'use client';

import { Languages } from 'lucide-react';
import { cn } from '../lib/utils';
import { Select } from '../components/select';
import { VisuallyHidden } from '../components/accessibility';
import { ODS_LOCALES, type OdsLocale } from './types';
import { useTranslationOptional } from './i18n-provider';

const LOCALE_LABELS: Record<OdsLocale, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  ar: 'العربية',
  zh: '中文',
};

export type LocaleSwitcherProps = {
  className?: string;
};

/** Accessible locale selector — updates `lang` and `dir` on the document root. */
export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const i18n = useTranslationOptional();
  if (!i18n) return null;

  const { locale, setLocale, t } = i18n;

  return (
    <div className={cn('inline-flex min-w-0 items-center gap-2', className)}>
      <Languages className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <VisuallyHidden>{t('shell.localeLabel')}</VisuallyHidden>
      <Select
        className="h-9 min-w-[7rem] rounded-md border border-input bg-background px-2 text-sm"
        value={locale}
        aria-label={t('shell.localeLabel')}
        onChange={(event) => setLocale(event.target.value as OdsLocale)}
      >
        {ODS_LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </Select>
    </div>
  );
}
