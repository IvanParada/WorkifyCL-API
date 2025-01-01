import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

  async requestPasswordReset(email: string): Promise<String> {
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

    return user.resetCode;
  }

  async signup(createUserDto: CreateUserDto): Promise<User> {

    if(!createUserDto.name){
      throw new InternalServerErrorException({message: 'Name user is required'});
    }

    if(createUserDto.name.length < 3 ){
      throw new InternalServerErrorException({message: `Error with the name length. MinLength: 3, Current length: ${ createUserDto.name.length}` });
    }

    if(!createUserDto.phone){
      throw new InternalServerErrorException({message: 'Phone user is required'});
    }

    if(createUserDto.phone.length !== 12){
      throw new InternalServerErrorException({message: `Error with the phone length. Length exactly is 12, Current length: ${ createUserDto.phone.length}`});
    }

    if(!createUserDto.email){
      throw new InternalServerErrorException({message: 'Email user is rquired'});
    }

    if(!createUserDto.password){
      throw new InternalServerErrorException({message: 'Password user is required'});
    }

    if(createUserDto.password.length < 6){
      throw new InternalServerErrorException({message: `Error with password length. MinLength: 6, Current length: ${ createUserDto.password.length}` });
    }

    const { name, phone, email, password, ...rest } = createUserDto;
    
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
      name,
      phone,
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

    return this.jwtService.sign({ email: user.email, sub: user._id },{expiresIn: '24h'});
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
