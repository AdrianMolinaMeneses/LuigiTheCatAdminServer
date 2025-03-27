import {
  IsDateString,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @MinLength(5, { message: 'Mínimo 5 caracteres.' })
  @MaxLength(100, { message: 'Maximo 100 caracteres.' })
  description: string;

  @IsNumber({}, { message: 'El monto solo acepta valores numéricos.' })
  amount: number;

  @IsDateString()
  registerDate: string;
}
