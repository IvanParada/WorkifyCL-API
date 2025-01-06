import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class PostEntity {
  @Prop({ required: true })
   authorId: string;

  @Prop({ required: true, minlength: 4, maxlength: 25 })
  title: string;

  @Prop({ required: true})
  price: number;

  @Prop({ required: true})
  paymentType: string;

  @Prop({ required: true, minlength: 50, maxlength: 150 })
  description: string;
  
  @Prop({ required: true })
  serviceType: string;

  @Prop({ required: true})
  regions: string;

  @Prop({ required: true})
  comuna: string;

  @Prop()
  image: string;
  
  @Prop({ default: Date.now })
  createdAt: Date;

}

export type PostDocument = PostEntity & Document;
export const PostSchema = SchemaFactory.createForClass(PostEntity);
