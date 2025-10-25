import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  parentId?: number;

  @IsOptional()
  @IsInt()
  level?: number;

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
  meta_title: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  meta_description: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  image_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  page_type?: string;
}

