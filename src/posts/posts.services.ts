import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostDocument, PostEntity } from './dto/posts.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';


@Injectable()
export class PostsService {
  constructor(
    @InjectModel(PostEntity.name) 
    private readonly postModel: Model<PostDocument>
  ) { }
  
  //TODO: ADD IMGS IN CREATE POST

  async create(createPostDto: CreatePostDto, authorId: string): Promise<PostEntity>{

    if(createPostDto.title.length < 4 || createPostDto.title.length >25 ){
      throw new InternalServerErrorException({message: `Error with the title length. MinLength: 4, MaxLength: 25, Current length: ${ createPostDto.title.length } `});
    }

    if(createPostDto.price <= 0){
      throw new InternalServerErrorException({message: "Error with the price"});
    }
    
    if(createPostDto.description.length < 50 || createPostDto.description.length > 150 ){
      throw new InternalServerErrorException({message: `Error with the description length. MinLength: 50, MaxLength: 150, Current Length: ${ createPostDto.description.length }`});
    }

    if(createPostDto.serviceType != 'requestService' && createPostDto.serviceType != 'offeredService' ){
      throw new InternalServerErrorException({message: "Error with the service type. The type is different from 'requestService' or 'offeredService'"});
    }

    try{
      const postData = {...createPostDto, authorId}
      const createdPost = new this.postModel(postData);
      return createdPost.save();
    }catch (error){
      throw new InternalServerErrorException('Failed to create post');
    }
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
