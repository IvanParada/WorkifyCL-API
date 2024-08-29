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
    const hashedPassword = await bcrypt.hash(password, 12);
    const createdUser = new this.userModel({
      email,
      password: hashedPassword,
      ...rest,
    });
    return createdUser.save();
  }

  async signin(loginUserDto: LoginUserDto): Promise<string> {
    const { email, password } = loginUserDto;
    const user = await this.userModel.findOne({ email }).exec();
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    return this.jwtService.sign({ email: user.email, sub: user._id });
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
