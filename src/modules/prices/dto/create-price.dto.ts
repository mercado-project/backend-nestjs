import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePriceDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  price: number;
}

