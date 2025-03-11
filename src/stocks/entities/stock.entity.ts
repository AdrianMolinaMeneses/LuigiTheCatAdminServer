import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Product } from 'src/products/entities/product.entity';

@Schema()
export class Stock extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  product: Product;

  @Prop({ required: true, default: 0 })
  quantity: number;
}

export const StockSchema = SchemaFactory.createForClass(Stock);
