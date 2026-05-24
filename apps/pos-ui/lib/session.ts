export type PosSession = {
  terminalId: string;
  cashierId: string;
  shiftId: string;
  locationId: string;
};

const STORAGE_KEY = 'ordella.pos.session';

export function getSession(): PosSession {
  if (typeof window === 'undefined') {
    return {
      terminalId: '',
      cashierId: '',
      shiftId: '',
      locationId: '',
    };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      terminalId: '',
      cashierId: '',
      shiftId: '',
      locationId: '',
    };
  }

  try {
    return JSON.parse(raw) as PosSession;
  } catch {
    return {
      terminalId: '',
      cashierId: '',
      shiftId: '',
      locationId: '',
    };
  }
}

export function setSession(session: PosSession): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function hasValidSession(session: PosSession): boolean {
  return Boolean(session.terminalId && session.cashierId && session.shiftId && session.locationId);
}
