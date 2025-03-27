import { forwardRef, Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Stock, StockSchema } from './entities/stock.entity';
import { ProductsModule } from 'src/products/products.module';
import { StockMovementsController } from './stock-movements.controller';
import {
  StockMovement,
  StockMovementSchema,
} from './entities/stock-movement.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CashRegistersModule } from 'src/cash-registers/cash-registers.module';

@Module({
  controllers: [StocksController, StockMovementsController],
  providers: [StocksService],
  imports: [
    AuthModule,
    CashRegistersModule,
    forwardRef(() => ProductsModule),
    MongooseModule.forFeature([
      {
        name: Stock.name,
        schema: StockSchema,
      },
      {
        name: StockMovement.name,
        schema: StockMovementSchema,
      },
    ]),
  ],
  exports: [StocksService],
})
export class StocksModule {}
