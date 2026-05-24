import { IsUUID } from 'class-validator';

/** Terminal session context required on all POS operations. */
export class PosContextDto {
  @IsUUID()
  terminalId!: string;

  @IsUUID()
  cashierId!: string;

  @IsUUID()
  shiftId!: string;
}
