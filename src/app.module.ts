import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { StocksModule } from './stocks/stocks.module';
import { AuthModule } from './auth/auth.module';
import { CashRegistersModule } from './cash-registers/cash-registers.module';
import { ExpensesModule } from './expenses/expenses.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_CLUSTER}.7g0nl.mongodb.net/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`,
    ),
    ProductsModule,
    StocksModule,
    AuthModule,
    CashRegistersModule,
    ExpensesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
