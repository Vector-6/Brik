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
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPasswordHash = this.configService.get<string>('ADMIN_PASSWORD_HASH');

    // Validate environment variables are set
    if (!adminEmail || !adminPasswordHash) {
      this.logger.error('Admin credentials not configured in environment variables');
      throw new UnauthorizedException('Authentication not configured');
    }

    // Validate email
    if (email !== adminEmail) {
      this.logger.warn(`Failed login attempt for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    // Note: For production, you should hash the ADMIN_PASSWORD_HASH in .env using bcrypt
    // For now, supporting both plain text (for backwards compatibility) and hashed passwords
    let isPasswordValid = false;

    // Check if the stored password is hashed (bcrypt hashes start with $2b$ or $2a$)
    if (adminPasswordHash.startsWith('$2b$') || adminPasswordHash.startsWith('$2a$')) {
      isPasswordValid = await bcrypt.compare(password, adminPasswordHash);
    } else {
      // Plain text comparison (not recommended for production)
      isPasswordValid = password === adminPasswordHash;
      if (isPasswordValid) {
        this.logger.warn('⚠️  Using plain text password. Please hash your ADMIN_PASSWORD_HASH in production!');
      }
    }

    if (!isPasswordValid) {
      this.logger.warn(`Failed login attempt for email: ${email}`);
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
