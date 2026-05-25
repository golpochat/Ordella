export class NotificationPreferenceResponseDto {
  id!: string;
  tenantId!: string;
  userId!: string;
  emailEnabled!: boolean;
  smsEnabled!: boolean;
  pushEnabled!: boolean;
  categories!: string[];
  createdAt!: Date;
  updatedAt!: Date | null;
}
