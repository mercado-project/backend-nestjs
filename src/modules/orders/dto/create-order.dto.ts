import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  @IsNotEmpty()
  customerId: number;

  @IsOptional()
  @IsInt()
  deliveryAddressId?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  shippingFee: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  totalAmount: number;

  @IsEnum(['pending', 'paid', 'shipped', 'delivered', 'canceled'])
  status: string;

  @IsEnum(['card', 'pix', 'boleto'])
  paymentMethod: string;
}

