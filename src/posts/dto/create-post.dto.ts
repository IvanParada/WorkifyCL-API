import { IsDate, IsNotEmpty, IsNumber, IsString, Max, MaxLength, MinLength } from "class-validator";

export class CreatePostDto {

  @IsString()
  @IsNotEmpty()
  @MinLength(4)   
  @MaxLength(25) 
  title: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  paymentType: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  @MaxLength(150)
  description: string;

  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @IsString()
  @IsNotEmpty()
  regions: string;

  @IsString()
  @IsNotEmpty()
  comuna: string;

  @IsString()
  @IsNotEmpty()
  image?: string;


  }
  