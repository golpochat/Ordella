import { PosCartLine } from '../types';

export function cartLineKey(line: Pick<PosCartLine, 'productId' | 'variantId' | 'bundleId'>): string {
  return `${line.productId}:${line.variantId ?? ''}:${line.bundleId ?? ''}`;
}

export function findCartLineIndex(lines: PosCartLine[], key: string): number {
  return lines.findIndex((line) => cartLineKey(line) === key);
}
