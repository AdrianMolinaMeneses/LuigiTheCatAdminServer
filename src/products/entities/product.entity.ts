import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Product extends Document {
  //_id?: string;

  @Prop({ unique: true, required: true, minlength: 5, maxlength: 100 })
  name: string;

  @Prop({ maxlength: 500 })
  description: string;

  @Prop({ required: true, default: 0 })
  price: number;

  @Prop({ required: true })
  size: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: [] })
  urlImages: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
