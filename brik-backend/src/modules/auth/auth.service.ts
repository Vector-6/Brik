import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

/**
 * Auth Service
 * Handles admin authentication logic
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  /**
   * Admin Login
   * Validates credentials against environment variables and returns JWT token
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Get admin credentials from environment
    // Try reading directly from process.env first (before variable expansion)
    const adminEmail = process.env.ADMIN_EMAIL || this.configService.get<string>('ADMIN_EMAIL');
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || this.configService.get<string>('ADMIN_PASSWORD_HASH');

    // Validate environment variables are set
    if (!adminEmail || !adminPasswordHash) {
      this.logger.error('Admin credentials not configured in environment variables');
      this.logger.error(`ADMIN_EMAIL: ${adminEmail ? 'SET' : 'NOT SET'}`);
      this.logger.error(`ADMIN_PASSWORD_HASH: ${adminPasswordHash ? 'SET' : 'NOT SET'}`);
      throw new UnauthorizedException('Authentication not configured');
    }

    // Log configuration for debugging (hash is safe to log - it's meant to be public)
    this.logger.debug(`Admin email from env: "${adminEmail}" (length: ${adminEmail?.length || 0})`);
    this.logger.debug(`Admin hash from env: ${adminPasswordHash ? adminPasswordHash.substring(0, 20) + '...' : 'NULL'} (length: ${adminPasswordHash?.length || 0})`);
    this.logger.debug(`Full hash from process.env: ${process.env.ADMIN_PASSWORD_HASH ? process.env.ADMIN_PASSWORD_HASH.substring(0, 20) + '...' : 'NULL'} (length: ${process.env.ADMIN_PASSWORD_HASH?.length || 0})`);

    // Normalize email (trim and lowercase for comparison)
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedAdminEmail = adminEmail.trim().toLowerCase();

    // Validate email
    if (normalizedEmail !== normalizedAdminEmail) {
      this.logger.warn(`Failed login attempt - Email mismatch`);
      this.logger.debug(`Received: "${email}" (normalized: "${normalizedEmail}")`);
      this.logger.debug(`Expected: "${adminEmail}" (normalized: "${normalizedAdminEmail}")`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    // Note: For production, you should hash the ADMIN_PASSWORD_HASH in .env using bcrypt
    // For now, supporting both plain text (for backwards compatibility) and hashed passwords
    let isPasswordValid = false;

    // Check if the stored password is hashed (bcrypt hashes start with $2b$ or $2a$)
    if (adminPasswordHash.startsWith('$2b$') || adminPasswordHash.startsWith('$2a$')) {
      // Trim password to avoid whitespace issues
      const trimmedPassword = password?.trim();
      isPasswordValid = await bcrypt.compare(trimmedPassword, adminPasswordHash);
      if (!isPasswordValid) {
        this.logger.debug('Password comparison failed (bcrypt hash)');
        this.logger.debug(`Password received: "${password}" (length: ${password?.length})`);
        this.logger.debug(`Password trimmed: "${trimmedPassword}" (length: ${trimmedPassword?.length})`);
        this.logger.debug(`Hash prefix: ${adminPasswordHash.substring(0, 7)}...`);
        // Test if password has any hidden characters
        if (password) {
          this.logger.debug(`Password bytes: ${Buffer.from(password).toString('hex')}`);
        }
      }
    } else {
      // Plain text comparison (not recommended for production)
      // Trim both passwords for comparison to avoid whitespace issues
      const trimmedPassword = password?.trim();
      const trimmedAdminPassword = adminPasswordHash.trim();
      isPasswordValid = trimmedPassword === trimmedAdminPassword;
      
      if (isPasswordValid) {
        this.logger.warn('⚠️  Using plain text password. Please hash your ADMIN_PASSWORD_HASH in production!');
      } else {
        this.logger.debug('Password comparison failed (plain text)');
        this.logger.debug(`Received length: ${trimmedPassword?.length}, Expected length: ${trimmedAdminPassword.length}`);
      }
    }

    if (!isPasswordValid) {
      this.logger.warn(`Failed login attempt for email: ${normalizedEmail}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      email: adminEmail,
      role: 'admin',
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`Admin logged in successfully: ${email}`);

    return {
      access_token: accessToken,
      email: adminEmail,
      expiresIn: '24h',
    };
  }

  /**
   * Utility method to hash a password
   * This can be used to generate hashed password for .env
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
