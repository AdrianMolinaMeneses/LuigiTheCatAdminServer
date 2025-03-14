import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Stock } from './stock.entity';

@Schema()
export class StockMovement extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: true,
  })
  stock: Stock;

  @Prop({ required: true })
  registerDate: Date;

  @Prop({ required: true })
  type: string;

  @Prop({ default: true })
  status: boolean;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unitPrice: number;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true })
  description: string;
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);
