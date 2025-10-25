import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProductImageDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  image_url: string;

  @IsOptional()
  @IsBoolean()
  is_main?: boolean;
}
