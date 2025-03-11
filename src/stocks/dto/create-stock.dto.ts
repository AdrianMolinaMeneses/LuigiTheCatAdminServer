import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateStockDto {
  @IsMongoId()
  @IsNotEmpty()
  product: string;
}
