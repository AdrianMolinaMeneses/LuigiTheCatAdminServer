import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Stock } from './entities/stock.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class StocksService {
  constructor(
    @InjectModel(Stock.name) private stockModel: Model<Stock>,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
  ) {}

  async create(createStockDto: CreateStockDto): Promise<Stock> {
    try {
      const newStock = new this.stockModel(createStockDto);

      await newStock.save();

      const stock = newStock.toJSON();

      return stock;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Something terrible happen!!!');
    }
  }

  async findAll(filters: {
    query: string;
    size: string;
    color: string;
  }): Promise<Stock[]> {
    try {
      const query: any = {};

      const products = await this.productsService.findAll(filters);
      const productsIds = products.map((product) => product._id);
      query.product = { $in: productsIds };

      return await this.stockModel.find(query).populate('product').exec();
    } catch (error) {
      throw new InternalServerErrorException('Something terrible happen!!!');
    }
  }

  async findOne(id: string): Promise<Stock> {
    try {
      const stock = await this.stockModel.findById(id).exec();

      if (stock) {
        return stock;
      } else {
        throw new BadRequestException(`El stock con ID ${id} no existe!`);
      }
    } catch (error) {
      if (error.status === 400) {
        throw new BadRequestException(error.response.message);
      }
      throw new BadRequestException('ID no valido');
    }
  }

  async findOneByProductId(productId: string): Promise<Stock> {
    try {
      const stock = await this.stockModel
        .findOne({ product: productId })
        .exec();

      if (stock) {
        return stock;
      } else {
        throw new BadRequestException(`El stock no existe!`);
      }
    } catch (error) {
      if (error.status === 400) {
        throw new BadRequestException(error.response.message);
      }
      throw new BadRequestException('ID no valido');
    }
  }

  update(id: number, updateStockDto: UpdateStockDto) {
    return `This action updates a #${id} stock`;
  }

  async remove(id: string) {
    try {
      const stockToDelete = await this.findOne(id);

      if (stockToDelete) {
        return await this.stockModel.deleteOne({ _id: id });
      } else {
        throw new BadRequestException(`El stock con ID ${id} no existe!`);
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
