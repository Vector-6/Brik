/**
 * Auth Response DTO
 * Response structure for successful authentication
 */
export class AuthResponseDto {
  access_token: string;
  email: string;
  expiresIn: string;
}
