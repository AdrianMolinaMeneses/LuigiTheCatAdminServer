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
import { StockMovement } from './entities/stock-movement.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { TypeStockMovementEnum } from './interfaces/type-stock-movement-enum.interface';

@Injectable()
export class StocksService {
  constructor(
    @InjectModel(Stock.name) private stockModel: Model<Stock>,
    @InjectModel(StockMovement.name)
    private stockMovementModel: Model<StockMovement>,
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

  async update(id: string, updateStockDto: Stock) {
    try {
      const stockToUpdate = await this.findOne(id);

      if (stockToUpdate) {
        await this.stockModel.replaceOne({ _id: id }, updateStockDto);
        return await this.findOne(id);
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

  async createStockMovement(
    createStockMovementDto: CreateStockMovementDto,
  ): Promise<StockMovement> {
    try {
      const stock = await this.findOne(createStockMovementDto.stock);
      console.log({ SM: createStockMovementDto, S: stock });
      if (stock) {
        stock.quantity = this.verifyStockQuantity(
          createStockMovementDto,
          stock,
        );

        console.log({ SAU: stock });
        await this.update(stock._id!.toString(), stock);

        const newStockMovement = new this.stockMovementModel({
          ...createStockMovementDto,
          registerDate: new Date(createStockMovementDto.registerDate),
        });

        await newStockMovement.save();

        const stockMovement = newStockMovement.toJSON();

        return stockMovement;
      } else {
        throw new BadRequestException(
          `El stock con ID ${createStockMovementDto.stock} no existe!`,
        );
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Something terrible happen!!!');
    }
  }

  async findAllStockMovements(
    startDate: string,
    endDate: string,
  ): Promise<StockMovement[]> {
    try {
      const query: any = {};
      console.log({ start: new Date(startDate), end: new Date(endDate) });

      query.registerDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };

      return await this.stockMovementModel
        .find(query)
        .populate({ path: 'stock', populate: { path: 'product' } })
        .sort({ registerDate: -1 })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException('Something terrible happen!!!');
    }
  }

  private verifyStockQuantity(
    createStockMovementDto: CreateStockMovementDto,
    stock: Stock,
  ): number {
    switch (createStockMovementDto.type) {
      case TypeStockMovementEnum.ENTRY:
        return stock.quantity + createStockMovementDto.quantity;

      case TypeStockMovementEnum.DISCHARGE:
        if (stock.quantity < createStockMovementDto.quantity) {
          throw new BadRequestException(
            'Error: La cantidad en el stock es menor a la que se quiere retirar',
          );
        }
        return stock.quantity - createStockMovementDto.quantity;

      //opcion 3 sera cuando se quiera anular un ingreso o egreso

      default:
        throw new BadRequestException('Error: Opción invalida');
    }
  }
}
