import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.services';
import { PostSchema, PostEntity } from './dto/posts.schema';
import { UsersModule } from 'src/users/users.module';



@Module({
  imports: [
    MongooseModule.forFeature([{ name: PostEntity.name , schema: PostSchema }]),
    JwtModule,
    UsersModule
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule { }
