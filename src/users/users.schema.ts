import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User {
 
  @Prop({ required: true, minlength: 3})
  name: string;
  
  @Prop({ require: true, minlength: 12, maxlength: 12})
  phone: string;

  @Prop({ required: true})
  email: string;

  @Prop({ required: true, minlength: 6})
  password: string;
 

  @Prop()
  resetToken?: string;

  @Prop()
  resetTokenExpires?: Date;

  @Prop()
  resetCode?: string;

  @Prop()
  resetCodeExpires?: Date;

  @Prop()
  isVerified?: Boolean;
  
  @Prop()
  verificationCode?: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
