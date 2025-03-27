import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { Expense, ExpenseSchema } from './entities/expense.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { CashRegistersModule } from 'src/cash-registers/cash-registers.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ExpensesController],
  providers: [ExpensesService],
  imports: [
    AuthModule,
    CashRegistersModule,
    MongooseModule.forFeature([
      {
        name: Expense.name,
        schema: ExpenseSchema,
      },
    ]),
  ],
})
export class ExpensesModule {}
