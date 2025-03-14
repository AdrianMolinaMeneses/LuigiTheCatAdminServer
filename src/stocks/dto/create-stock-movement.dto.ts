import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { TypeStockMovementEnum } from '../interfaces/type-stock-movement-enum.interface';

export class CreateStockMovementDto {
  @IsMongoId()
  @IsNotEmpty()
  stock: string;

  @IsDateString()
  registerDate: string;

  @IsEnum(TypeStockMovementEnum, {
    message: 'No es un valor para el tipo de movimiento.',
  })
  type: string;

  @IsNumber({}, { message: 'La cantidad solo acepta valores numéricos.' })
  quantity: number;

  @IsNumber(
    {},
    { message: 'El precio unitario solo acepta valores numéricos.' },
  )
  unitPrice: number;

  @IsNumber({}, { message: 'El monto total solo acepta valores numéricos.' })
  totalAmount: number;

  @IsString()
  description: string;
}
