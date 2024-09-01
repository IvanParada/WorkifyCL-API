import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/users.schema';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { MailerService } from '@nestjs-modules/mailer/dist/mailer.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new Error('User not found');
    }

    const resetCode = crypto.randomInt(100000, 999999).toString();

    const expiresIn = new Date();
    expiresIn.setHours(expiresIn.getHours() + 1);

    user.resetCode = resetCode; 
    user.resetCodeExpires = expiresIn; 
    await user.save();

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      text: `To reset your password, please use the following code: ${resetCode}. This code will expire in 1 hour.`,
    });
  }

  async signup(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, ...rest } = createUserDto;
    
    let user = await this.userModel.findOne({ email }).exec();
    
    if (user) {
      if (!user.isVerified) {
        user.verificationCode = this.generateVerificationCode();
        await user.save();
        await this.sendVerificationEmail(user.email, user.verificationCode);
      }
      throw new Error('El usuario ya está registrado, pero no verificado. Se ha enviado un nuevo código de verificación.');
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = this.generateVerificationCode();
    const createdUser = new this.userModel({
      email,
      password: hashedPassword,
      isVerified: false,
      verificationCode,
      ...rest,
    });
    await createdUser.save();
    
    await this.sendVerificationEmail(email, verificationCode);
    
    return createdUser;
  }

  async signin(loginUserDto: LoginUserDto): Promise<string> {
    const { email, password } = loginUserDto;
    const user = await this.userModel.findOne({ email }).exec();
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Credenciales inválidas');
    }

    if (!user.isVerified) {
      throw new Error('La cuenta no ha sido verificada. Por favor, revisa tu correo electrónico.');
    }

    return this.jwtService.sign({ email: user.email, sub: user._id });
  }


  async verifyEmail(email: string, verificationCode: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email, verificationCode }).exec();
    
    if (!user) {
      throw new Error('Código de verificación inválido.');
    }

    user.isVerified = true;
    user.verificationCode = null; 
    await user.save();
    
    return true;
  }

  private generateVerificationCode(): string {
    return crypto.randomBytes(3).toString('hex');
  }

  private async sendVerificationEmail(email: string, code: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verifica tu cuenta',
      text: `Tu código de verificación es: ${code}`,
    });
  }


  async resetPassword(resetCode: string, newPassword: string): Promise<void> {
    const user = await this.userModel
      .findOne({
        resetCode: resetCode,
        resetCodeExpires: { $gt: new Date() },
      })
      .exec();

    if (!user) {
      throw new Error('Invalid or expired code');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();
  }
}
