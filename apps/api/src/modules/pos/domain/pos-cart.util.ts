import { PosCartLine } from '../types';

export function cartLineKey(line: Pick<PosCartLine, 'productId' | 'variantId'>): string {
  return `${line.productId}:${line.variantId ?? ''}`;
}

export function findCartLineIndex(lines: PosCartLine[], key: string): number {
  return lines.findIndex((line) => cartLineKey(line) === key);
}
