import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CancelStockMovementDto {
  @IsMongoId()
  @IsNotEmpty()
  _id: string;
}
