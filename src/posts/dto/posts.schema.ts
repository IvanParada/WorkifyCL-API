import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class PostEntity {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  authorId: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export type PostDocument = PostEntity & Document;
export const PostSchema = SchemaFactory.createForClass(PostEntity);
