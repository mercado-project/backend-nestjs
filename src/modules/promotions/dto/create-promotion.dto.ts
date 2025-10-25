import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePromotionDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  promotionalPrice: number;

  @IsDateString()
  @IsNotEmpty()
  startAt: string;

  @IsDateString()
  @IsNotEmpty()
  endAt: string;

  @IsBoolean()
  @IsNotEmpty()
  active: boolean;
}

