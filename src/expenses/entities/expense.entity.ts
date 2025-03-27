import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Expense extends Document {
  @Prop({ required: true, minlength: 5, maxlength: 100 })
  description: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  registerDate: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
