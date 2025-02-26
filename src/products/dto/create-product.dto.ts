import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(5, { message: 'Mínimo 5 caracteres.' })
  @MaxLength(100, { message: 'Maximo 100 caracteres.' })
  name: string;

  @IsString()
  @MaxLength(500, { message: 'Maximo 500 caracteres.' })
  description: string;

  @IsNumber({}, { message: 'El precio solo acepta valores numéricos.' })
  price: number;
}
