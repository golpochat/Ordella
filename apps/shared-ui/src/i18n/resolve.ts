import type { TranslationParams, TranslationTree, TranslationValue } from './types';

const MISSING_LOG = new Set<string>();

function getNested(tree: TranslationTree, key: string): TranslationValue | undefined {
  const parts = key.split('.');
  let current: TranslationValue | undefined = tree;
  for (const part of parts) {
    if (!current || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return current;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => {
    const value = params[name];
    return value === undefined || value === false ? '' : String(value);
  });
}

export function resolveTranslation(
  messages: TranslationTree,
  fallbackMessages: TranslationTree,
  key: string,
  params?: TranslationParams,
): string {
  const raw = getNested(messages, key) ?? getNested(fallbackMessages, key);
  if (typeof raw === 'string') {
    return interpolate(raw, params);
  }
  if (process.env.NODE_ENV === 'development' && !MISSING_LOG.has(key)) {
    MISSING_LOG.add(key);
    console.warn(`[ODS i18n] Missing translation key: ${key}`);
  }
  return interpolate(key, params);
}

export function mergeMessages(base: TranslationTree, override?: TranslationTree): TranslationTree {
  if (!override) return base;
  const result: TranslationTree = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && typeof result[key] === 'object') {
      result[key] = mergeMessages(result[key] as TranslationTree, value as TranslationTree);
    } else {
      result[key] = value;
    }
  }
  return result;
}
