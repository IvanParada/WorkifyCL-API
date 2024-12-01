import { Injectable} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostDocument, PostEntity } from './dto/posts.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(@InjectModel(PostEntity.name) private readonly postModel: Model<PostDocument>) {}

  async create(createPostDto: CreatePostDto): Promise<PostEntity> {
    const createdPost = new this.postModel(createPostDto);
    return createdPost.save();
  }

  async findAll(): Promise<PostEntity[]> {
    return this.postModel.find().exec();
  }

  async findOne(id: string): Promise<PostEntity> {
    return this.postModel.findById(id).exec();
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<PostEntity> {
    return this.postModel.findByIdAndUpdate(id, updatePostDto, { new: true }).exec();
  }

  async remove(id: string): Promise<PostEntity> {
    return this.postModel.findByIdAndDelete(id).exec();
  }
}
