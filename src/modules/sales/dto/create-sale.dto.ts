import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class CreateSaleDto {
  @IsInt()
  @IsNotEmpty()
  customerId: number;

  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  unitPrice: number;

  @IsEnum(['card', 'pix', 'boleto'])
  @IsNotEmpty()
  paymentMethod: string;

  @IsInt()
  @IsOptional()
  orderId?: number;
}
