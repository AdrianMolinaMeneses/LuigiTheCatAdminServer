import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Product extends Document {
  //_id?: string;

  @Prop({ required: true, minlength: 5, maxlength: 100 })
  name: string;

  @Prop({ maxlength: 500 })
  description: string;

  @Prop({ required: true, default: 0 })
  purchasePrice: number;

  @Prop({ required: true, default: 0 })
  salePrice: number;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  size: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: [] })
  urlImages: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
