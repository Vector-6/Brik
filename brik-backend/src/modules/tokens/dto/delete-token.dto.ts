/**
 * Delete Token DTOs
 * 
 * Request/Response types for deleting a token from the database
 */

export class DeleteTokenResponseDto {
  success: boolean;
  message: string;
  deletedToken: {
    id: string;
    symbol: string;
    name: string;
  };
}
