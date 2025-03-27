import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class CashRegister extends Document {
  @Prop({ required: true, minlength: 5, maxlength: 100 })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop({ default: 0 })
  totalAmount: number;
}

export const CashRegisterSchema = SchemaFactory.createForClass(CashRegister);
