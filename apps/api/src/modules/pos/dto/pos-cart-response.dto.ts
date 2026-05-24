import { PosCartLine } from '../types';

export class PosCartResponseDto {
  cartId!: string;
  terminalId!: string;
  cashierId!: string;
  shiftId!: string;
  locationId!: string;
  items!: PosCartLine[];
  orderId?: string;
  createdAt!: string;
  updatedAt!: string;
}
