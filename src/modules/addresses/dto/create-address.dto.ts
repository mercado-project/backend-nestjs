import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { AddressType } from '../entities/address.entity';

export class CreateAddressDto {
  @IsNotEmpty()
  customerId: number;

  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  street: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  number: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  complement?: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  neighborhood: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  state: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 8)
  cep: string;

  @IsEnum(AddressType)
  type: AddressType;
}

