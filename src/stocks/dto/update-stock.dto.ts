import { PartialType } from '@nestjs/mapped-types';
import { CreateStockDto } from './create-stock.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateStockDto extends PartialType(CreateStockDto) {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
