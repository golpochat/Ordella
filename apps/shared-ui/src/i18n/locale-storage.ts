import { ODS_DEFAULT_LOCALE, type OdsLocale } from './types';

export const ODS_LOCALE_STORAGE_KEY = 'ods-locale';

export function readStoredLocale(): OdsLocale {
  if (typeof window === 'undefined') return ODS_DEFAULT_LOCALE;
  try {
    const value = window.localStorage.getItem(ODS_LOCALE_STORAGE_KEY);
    if (value === 'en' || value === 'fr' || value === 'de' || value === 'es' || value === 'ar' || value === 'zh') {
      return value;
    }
  } catch {
    /* ignore */
  }
  return ODS_DEFAULT_LOCALE;
}

export function storeLocale(locale: OdsLocale): void {
  try {
    window.localStorage.setItem(ODS_LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

/** Runs before paint to set `lang` and `dir` without flash. */
export const ODS_LOCALE_BOOTSTRAP_SCRIPT = `(function(){try{var l=localStorage.getItem('${ODS_LOCALE_STORAGE_KEY}')||'en';var rtl=l==='ar'||l==='he';var root=document.documentElement;root.lang=l;root.dir=rtl?'rtl':'ltr';root.dataset.odsLocale=l;}catch(e){}})();`;
