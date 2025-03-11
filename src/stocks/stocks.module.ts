import { forwardRef, Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Stock, StockSchema } from './entities/stock.entity';
import { ProductsModule } from 'src/products/products.module';

@Module({
  controllers: [StocksController],
  providers: [StocksService],
  imports: [
    forwardRef(() => ProductsModule),
    MongooseModule.forFeature([
      {
        name: Stock.name,
        schema: StockSchema,
      },
    ]),
  ],
  exports: [StocksService],
})
export class StocksModule {}
