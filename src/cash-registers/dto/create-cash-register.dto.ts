import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { TypeCashRegisterEnum } from '../interfaces/type-cash-register-enum.interface';

export class CreateCashRegisterDto {
  @IsString()
  @MinLength(5, { message: 'Mínimo 5 caracteres.' })
  @MaxLength(100, { message: 'Maximo 100 caracteres.' })
  name: string;

  @IsEnum(TypeCashRegisterEnum, { message: 'El tipo no es un valor válido.' })
  type: string;
}
