import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateCmsDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  url: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  pageType?: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  metaTitle: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  metaDescription: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  bannerImage?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

