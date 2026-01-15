import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JWT Strategy
 * Validates JWT tokens and extracts payload
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_ADMIN_SECRET');
    
    // Use a default secret for development if not provided
    // In production, this should always be set
    const jwtSecret = secret || 'dev-secret-change-in-production';
    
    if (!secret) {
      console.warn('⚠️  JWT_ADMIN_SECRET is not defined. Using default secret (NOT SECURE FOR PRODUCTION)');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Validate JWT payload
   * This method is called automatically by Passport after token verification
   */
  async validate(payload: any) {
    if (!payload.email || payload.role !== 'admin') {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      email: payload.email,
      role: payload.role,
    };
  }
}
