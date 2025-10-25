import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateStockDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @Min(0)
  quantity: number;
}

