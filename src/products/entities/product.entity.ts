import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ProductStatus } from '../interfaces/product-status.enum';

@Schema()
export class Product {
  _id?: string;

  @Prop({ unique: true, required: true, minlength: 5, maxlength: 100 })
  name: string;

  @Prop({ maxlength: 500 })
  description: string;

  @Prop({ required: true, default: 0 })
  price: number;

  @Prop({ default: ProductStatus.available })
  status: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: [] })
  urlImages: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
