import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.services';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Response } from 'express';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const user = await this.authService.signup(createUserDto);
      return res.status(HttpStatus.CREATED).json(user);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  @Post('verify-email')
  async verifyEmail(@Body('email') email: string, @Body('code') code: string): Promise<{ message: string }> {
    const isVerified = await this.authService.verifyEmail(email, code);
    
    if (isVerified) {
      return { message: 'Cuenta verificada con éxito.' };
    } else {
      return { message: 'Código de verificación inválido.' };
    }
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    try {
      const token = await this.authService.signin(loginUserDto);
      return res.status(HttpStatus.OK).json({ token });
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: error.message });
    }
  }

  @Post('request-reset-password')
  async requestPasswordReset(@Body('email') email: string, @Res() res: Response) {
    try {
      await this.authService.requestPasswordReset(email);
      return res.status(HttpStatus.OK).json({ message: 'Password reset email sent' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Res() res: Response) {
    try {
      await this.authService.resetPassword(resetPasswordDto.resetCode, resetPasswordDto.newPassword);
      return res.status(HttpStatus.OK).json({ message: 'Password reset successfully' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }
}
