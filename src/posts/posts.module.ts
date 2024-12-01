import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.services';
import { PostSchema } from './dto/posts.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Post', schema: PostSchema }]),
    JwtModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
