import { IsDateString, IsNotEmpty, IsOptional, IsString, Length, MaxLength, IsEmail } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName: string;

  @IsString()
  @Length(11, 11)
  cpf: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @MaxLength(20)
  phone: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @Length(8, 255)
  password?: string;
}

