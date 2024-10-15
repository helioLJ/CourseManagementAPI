import { Controller, Post, UseGuards, Req, Res, Get, Body, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body('email') email: string, @Res() res: Response) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    
    try {
      // Generate the magic link
      const token = this.authService.jwtService.sign({ email }, { expiresIn: '15m' });
      const href = `http://localhost:3000/auth/login/callback?token=${token}`;
      
      // Send the magic link
      await this.authService.sendMagicLink(email, href);
      res.status(200).json({ message: 'Magic link sent successfully' });
    } catch (error) {
      console.error('Error sending magic link:', error);
      res.status(500).json({ message: 'Error sending magic link' });
    }
  }

  @Get('login/callback')
  @UseGuards(AuthGuard('magic-login'))
  async loginCallback(@Req() req: any) {
    console.log('Reached login callback');
    console.log('User:', req.user);
    return this.authService.login(req.user);
  }
}
