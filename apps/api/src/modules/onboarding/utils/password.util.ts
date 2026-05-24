import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored.startsWith('scrypt:')) {
    return false;
  }
  const [, salt, hashHex] = stored.split(':');
  if (!salt || !hashHex) {
    return false;
  }
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return derived.toString('hex') === hashHex;
}
