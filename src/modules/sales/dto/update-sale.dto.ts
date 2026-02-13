import {
  IsInt,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateSaleDto {
  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  unitPrice?: number;

  @IsEnum(['pending', 'paid', 'shipped', 'delivered', 'canceled'])
  @IsOptional()
  status?: string;

  @IsEnum(['card', 'pix', 'boleto'])
  @IsOptional()
  paymentMethod?: string;
}
