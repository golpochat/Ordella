export type ShortcutScopeId = 'global' | 'page' | 'modal' | 'form' | 'table';

/** Scope priority — higher wins when multiple shortcuts match. */
export const SHORTCUT_SCOPE_PRIORITY: Record<ShortcutScopeId, number> = {
  global: 10,
  page: 20,
  form: 30,
  table: 35,
  modal: 40,
};

export type ParsedShortcut = {
  mod: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
};

export function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
}

export function parseShortcutCombo(combo: string): ParsedShortcut {
  const parts = combo.toLowerCase().split('+').map((part) => part.trim());
  const key = parts.pop() ?? '';
  return {
    mod: parts.includes('mod') || parts.includes('cmd') || parts.includes('ctrl'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt') || parts.includes('option'),
    key,
  };
}

export function eventMatchesShortcut(event: KeyboardEvent, combo: string): boolean {
  const parsed = parseShortcutCombo(combo);
  const eventKey = event.key.length === 1 ? event.key.toLowerCase() : event.key;

  if (parsed.mod && !(event.metaKey || event.ctrlKey)) return false;
  if (!parsed.mod && (event.metaKey || event.ctrlKey)) return false;
  if (parsed.shift !== event.shiftKey) return false;
  if (parsed.alt !== event.altKey) return false;

  if (parsed.shift && (parsed.key === '/' || parsed.key === 'slash')) {
    return event.shiftKey && (eventKey === '?' || eventKey === '/');
  }
  if (parsed.key === 'slash' || parsed.key === '/') {
    return !event.shiftKey && (eventKey === '/' || event.code === 'Slash');
  }
  if (parsed.key === 'escape' || parsed.key === 'esc') {
    return eventKey === 'Escape';
  }
  if (parsed.key === 'arrowleft') return eventKey === 'ArrowLeft';
  if (parsed.key === 'arrowright') return eventKey === 'ArrowRight';
  if (parsed.key === 'arrowup') return eventKey === 'ArrowUp';
  if (parsed.key === 'arrowdown') return eventKey === 'ArrowDown';

  return eventKey.toLowerCase() === parsed.key.toLowerCase();
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest('[contenteditable="true"]'));
}

export function formatShortcutCombo(combo: string, platform: 'mac' | 'windows' = isMacPlatform() ? 'mac' : 'windows'): string {
  const parsed = parseShortcutCombo(combo);
  const parts: string[] = [];
  if (parsed.mod) parts.push(platform === 'mac' ? '⌘' : 'Ctrl');
  if (parsed.shift) parts.push(platform === 'mac' ? '⇧' : 'Shift');
  if (parsed.alt) parts.push(platform === 'mac' ? '⌥' : 'Alt');

  const keyLabel: Record<string, string> = {
    '/': '/',
    slash: '/',
    escape: 'Esc',
    esc: 'Esc',
    arrowleft: '←',
    arrowright: '→',
    arrowup: '↑',
    arrowdown: '↓',
  };

  const key = keyLabel[parsed.key] ?? parsed.key.toUpperCase();
  parts.push(key);
  return parts.join(platform === 'mac' ? '' : '+');
}
