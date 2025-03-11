import { forwardRef, Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './entities/product.entity';
import { StocksModule } from 'src/stocks/stocks.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    forwardRef(() => StocksModule),
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
