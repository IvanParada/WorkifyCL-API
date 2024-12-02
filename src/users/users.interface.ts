import { Document } from 'mongoose';

export interface User extends Document {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  //TODO: ADD USERPHONE AND PROFILE IMAGE
}
