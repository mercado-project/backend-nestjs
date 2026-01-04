import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  imageUrl: string;

  @IsString()
  linkUrl: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}