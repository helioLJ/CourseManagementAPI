import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import MagicLoginStrategy from 'passport-magic-login';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomMagicLoginStrategy extends PassportStrategy(MagicLoginStrategy, 'magic-login') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {
    super({
      secret: configService.get('JWT_SECRET') || 'secret',
      jwtOptions: {
        expiresIn: '15m',
      },
      callbackUrl: 'http://localhost:3000/auth/login/callback',
      sendMagicLink: async (destination, href) => {
        console.log(`Sending magic link to ${destination} with href: ${href}`);
        await authService.sendMagicLink(destination, href); // Pass both arguments
      },
      verify: async (payload, callback) => {
        console.log('Verify function called with payload:', payload);
        try {
          const user = await authService.validateUser(payload.email);
          if (!user) {
            console.log('User not found');
            return callback(null, false, { message: 'Invalid user' });
          }
          console.log('User authenticated successfully:', user);
          return callback(null, user);
        } catch (error) {
          console.error('Error in verify function:', error);
          return callback(error);
        }
      },
    });
  }
}
