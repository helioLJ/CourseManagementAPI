import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    public jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      // No auth option needed for MailHog
    });
  }

  async validateUser(email: string): Promise<any> {
    console.log('Validating user with email:', email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    console.log('User found:', user);
    if (user) {
      return user;
    }
    console.log('User not found');
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role }; // Include role
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async sendMagicLink(email: string, href: string) { // Updated to accept href
    console.log(`Sending magic link to ${email}: ${href}`);
    
    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        to: email,
        subject: 'Your Magic Login Link',
        text: `Click here to log in: ${href}`,
        html: `<p>Click <a href="${href}">here</a> to log in.</p>`,
      });
      console.log('Magic link email sent successfully');
    } catch (error) {
      console.error('Error sending magic link email:', error);
      throw error;
    }
  }
}
