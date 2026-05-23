/** API Spec §1.2 login response data */
export class LoginResponseDto {
  accessToken!: string;
  refreshToken!: string;
  expiresIn!: number;
  mfaRequired?: boolean;
}
