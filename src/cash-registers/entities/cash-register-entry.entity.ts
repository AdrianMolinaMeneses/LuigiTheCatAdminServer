import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsMongoId } from 'class-validator';
import { Document } from 'mongoose';

@Schema()
export class CashRegisterEntry extends Document {
  @Prop({ required: true })
  @IsMongoId({ message: 'Valor invalido' })
  cashRegisterId: string;

  @Prop()
  @IsMongoId({ message: 'Valor invalido' })
  stockMovementId: string;

  @Prop()
  @IsMongoId({ message: 'Valor invalido' })
  expenseId: string;

  @Prop({ required: true })
  registerDate: Date;

  @Prop({ required: true, minlength: 5, maxlength: 100 })
  description: string;

  @Prop({ required: true })
  type: string;

  @Prop({ default: 0 })
  amount: number;
}

export const CashRegisterEntrySchema =
  SchemaFactory.createForClass(CashRegisterEntry);
