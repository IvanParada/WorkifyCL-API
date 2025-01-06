import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostDocument, PostEntity } from './dto/posts.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UsersService } from 'src/users/users.service';
import { PostAuthorDto } from './dto/post-author.dto';



@Injectable()
export class PostsService {
  constructor(
    @InjectModel(PostEntity.name) 
    private readonly postModel: Model<PostDocument>,
    private readonly usersService: UsersService
  ) { }
  
  //TODO: ADD IMGS IN CREATE POST

  async create(createPostDto: CreatePostDto, authorId: string): Promise<PostEntity>{

    if(!createPostDto.title){
      throw new InternalServerErrorException({message: 'Title post is required'});
    }

    if(createPostDto.title.length < 4 || createPostDto.title.length >25 ){
      throw new InternalServerErrorException({message: `Error with the title length. MinLength: 4, MaxLength: 25, Current length: ${ createPostDto.title.length } `});
    }

    if(!createPostDto.price){
      throw new InternalServerErrorException({message: 'Price post is required'});
    }

    if(createPostDto.price <= 0){
      throw new InternalServerErrorException({message: "Error with the price"});
    }

    const validPaymentTypes = ['hour', 'day', 'month', 'work'];

    if(!createPostDto.paymentType){
      throw new InternalServerErrorException({message: 'Payment type post is required'});
    }

    if(!validPaymentTypes.includes(createPostDto.paymentType)){
      throw new InternalServerErrorException({message: "Error with the payment type. The type is different from 'hour', 'day', 'month' or 'work'"});
    }

    if(!createPostDto.description){
      throw new InternalServerErrorException({message: 'Description post is required'});
    }
    
    if(createPostDto.description.length < 50 || createPostDto.description.length > 150 ){
      throw new InternalServerErrorException({message: `Error with the description length. MinLength: 50, MaxLength: 150, Current Length: ${ createPostDto.description.length }`});
    }

    const validServiceTypes = ['requestService', 'offeredService'];
    
    if(!createPostDto.serviceType){
      throw new InternalServerErrorException({message: 'Service type post is required'});
    }

    if(!validServiceTypes.includes(createPostDto.serviceType)){
      throw new InternalServerErrorException({message: "Error with the service type. The type is different from 'requestService' or 'offeredService'"});
    }

    if(!createPostDto.regions){
      throw new InternalServerErrorException({message: 'Region post is required'});
    }

    if(!createPostDto.comuna){
      throw new InternalServerErrorException({message: 'Title post is required'});
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

  async findOne(id: string): Promise<PostAuthorDto> {
    const findPostById = await this.postModel.findById(id).exec();

    if(!findPostById){
     throw new InternalServerErrorException({message: 'Not found post'});
    }
    try {
      const findAuthorById = await this.usersService.findOne(findPostById.authorId);

      if(!findAuthorById){
        throw new InternalServerErrorException({message: 'Author not found'});
      } 

      const postInfo: PostAuthorDto = {
        title: findPostById.title,
        price: findPostById.price, 
        paymentType: findPostById.paymentType,
        description: findPostById.description,
        serviceType: findPostById.serviceType,
        regions:  findPostById.regions,
        comuna: findPostById.comuna,
        image: findPostById.image,
        createdAt: findPostById.createdAt,
        authorName: findAuthorById.name,
        authorPhone: findAuthorById.phone,
        authorEmail: findAuthorById.email 
      };
      return postInfo;
      
    } catch (error) {
      throw new InternalServerErrorException('Failed to find post');
    }
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<PostEntity> {
    return this.postModel.findByIdAndUpdate(id, updatePostDto, { new: true }).exec();
  }

  async remove(id: string): Promise<PostEntity> {
    return this.postModel.findByIdAndDelete(id).exec();
  }
  
}
