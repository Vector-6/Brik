import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

/**
 * Auth Controller
 * Handles admin authentication endpoints
 */
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Admin Login Endpoint
   * POST /api/auth/login
   * 
   * @param loginDto - Email and password credentials
   * @returns JWT token and admin details
   * 
   * @example
   * POST /api/auth/login
   * {
   *   "email": "admin@brik.com",
   *   "password": "brik$1212"
   * }
   * 
   * Response:
   * {
   *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "email": "admin@brik.com",
   *   "expiresIn": "24h"
   * }
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }
}
