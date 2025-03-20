import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './entities/product.entity';
import { Model } from 'mongoose';
import { StocksService } from 'src/stocks/stocks.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @Inject(forwardRef(() => StocksService))
    private readonly stocksService: StocksService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const newProduct = new this.productModel(createProductDto);

      await newProduct.save();

      const product = newProduct.toJSON();

      await this.stocksService.createStock({
        product: product._id.toString(),
      });

      return product;
    } catch (error) {
      // if (error.code === 11000) {
      //   throw new BadRequestException(
      //     `El producto ${createProductDto.name} ya existe!`,
      //   );
      // }
      throw new InternalServerErrorException('Something terrible happen!!!');
    }
  }

  async findAll(filters: {
    query: string;
    size: string;
    color: string;
  }): Promise<Product[]> {
    const query: any = {};

    if (filters.query) {
      const searchRegex = new RegExp(filters.query, 'i');
      query.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    if (filters.size) {
      query.size = filters.size;
    }

    if (filters.color) {
      query.color = filters.color;
    }

    try {
      return await this.productModel.find(query).sort({ name: 1 }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Something terrible happen!!!');
    }
    // const searchRegex = new RegExp(filters.query, 'i');

    // try {
    //   return await this.productModel
    //     .find({
    //       $or: [{ name: searchRegex }, { description: searchRegex }],
    //       size: filters.size,
    //     })
    //     .exec();
    // } catch (error) {
    //   throw new InternalServerErrorException('Something terrible happen!!!');
    // }
  }

  async findOne(id: string): Promise<Product> {
    try {
      const product = await this.productModel.findById(id).exec();

      if (product) {
        return product;
      } else {
        throw new BadRequestException(`El producto con ID ${id} no existe!`);
      }
    } catch (error) {
      if (error.status === 400) {
        throw new BadRequestException(error.response.message);
      }
      throw new BadRequestException('ID no valido');
    }
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product | null> {
    try {
      const productToUpdate = await this.findOne(id);

      if (productToUpdate) {
        await this.productModel.replaceOne({ _id: id }, updateProductDto);
        return await this.findOne(id);
      } else {
        throw new BadRequestException(`El producto con ID ${id} no existe!`);
      }
    } catch (error) {
      if (error.status === 400) {
        throw new BadRequestException(error.response.message);
      }
      // if (error.code === 11000) {
      //   throw new BadRequestException(
      //     `El producto ${updateProductDto.name} ya existe!`,
      //   );
      // }
      throw new BadRequestException('ID no valido');
    }
  }

  async remove(id: string) {
    try {
      const productToDelete = await this.findOne(id);

      if (productToDelete) {
        const stockToDelete = await this.stocksService.findOneStockByProductId(
          productToDelete._id!.toString(),
        );

        if (stockToDelete) {
          await this.stocksService.removeStock(stockToDelete._id!.toString());
        }

        return await this.productModel.deleteOne({ _id: id });
      } else {
        throw new BadRequestException(`El producto con ID ${id} no existe!`);
      }
    } catch (error) {
      console.log({ ERROR_REQ: error });
      if (error.status === 400) {
        throw new BadRequestException(error.response.message);
      }
      throw new BadRequestException('ID no valido');
    }
  }
}

// async findAll(searchParam: string): Promise<Product[]> {

//   try {
//     return await this.productModel.find({
//       $or: [
//         { name: { $regex: searchParam } },
//         { description: { $regex: searchParam } },
//       ],
//     });
//   } catch (error) {
//     throw new InternalServerErrorException('Something terrible happen!!!');
//   }
// }
