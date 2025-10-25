import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  url: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  brand: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  meta_title: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  meta_description: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  page_type?: string;

}

