import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { Stock } from './entities/stock.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from '../products/products.service';
import { StockMovement } from './entities/stock-movement.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { TypeStockMovementEnum } from './interfaces/type-stock-movement-enum.interface';
import { CancelStockMovementDto } from './dto/cancel-stock-movement.dto';
import { CashRegistersService } from '../cash-registers/cash-registers.service';

@Injectable()
export class StocksService {
  constructor(
    @InjectModel(Stock.name) private stockModel: Model<Stock>,
    @InjectModel(StockMovement.name)
    private stockMovementModel: Model<StockMovement>,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
    private readonly cashRegistersService: CashRegistersService,
  ) {}

  async createStock(createStockDto: CreateStockDto): Promise<Stock> {
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

  async findAllStocks(filters: {
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

  async findOneStockById(id: string): Promise<Stock> {
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

  async findOneStockByProductId(productId: string): Promise<Stock> {
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

  async updateStock(id: string, updateStockDto: Stock) {
    try {
      const stockToUpdate = await this.findOneStockById(id);

      if (stockToUpdate) {
        await this.stockModel.replaceOne({ _id: id }, updateStockDto);
        return await this.findOneStockById(id);
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

  async removeStock(id: string) {
    try {
      const stockToDelete = await this.findOneStockById(id);

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
      const TO_CREATE_STOCK_MOVEMENT = true;
      const expense = null;
      const stock = await this.findOneStockById(createStockMovementDto.stock);

      if (stock) {
        stock.quantity = this.updateStockQuantity(
          createStockMovementDto.type,
          createStockMovementDto.quantity,
          TO_CREATE_STOCK_MOVEMENT,
          stock,
        );

        await this.updateStock(stock._id!.toString(), stock);

        const newStockMovement = new this.stockMovementModel({
          ...createStockMovementDto,
          registerDate: new Date(createStockMovementDto.registerDate),
        });

        await newStockMovement.save();

        const stockMovement = newStockMovement.toJSON();

        await this.cashRegistersService.createOrDeleteCashRegisterEntry(
          stockMovement,
          expense,
          TO_CREATE_STOCK_MOVEMENT,
        );

        return stockMovement;
      } else {
        throw new BadRequestException(
          `El stock con ID ${createStockMovementDto.stock} no existe!`,
        );
      }
    } catch (error) {
      if (error.status === 400) {
        throw new BadRequestException(error.response.message);
      }
      throw new InternalServerErrorException('Something terrible happen!!!');
    }
  }

  async cancelStockMovement(
    id: string,
    cancelStockMovementDto: CancelStockMovementDto,
  ): Promise<StockMovement> {
    try {
      const TO_CREATE_STOCK_MOVEMENT = false;
      const expense = null;
      const stockMovement = await this.findOneStockMovement(id);
      const stock = await this.findOneStockById(
        stockMovement.stock._id!.toString(),
      );

      if (stock) {
        stock.quantity = this.updateStockQuantity(
          stockMovement.type,
          stockMovement.quantity,
          TO_CREATE_STOCK_MOVEMENT,
          stock,
        );

        await this.updateStock(stock._id!.toString(), stock);

        stockMovement.status = false;
        stockMovement.description = 'Movimiento anulado';
        await this.stockMovementModel.replaceOne({ _id: id }, stockMovement);

        await this.cashRegistersService.createOrDeleteCashRegisterEntry(
          stockMovement,
          expense,
          TO_CREATE_STOCK_MOVEMENT,
        );

        return stockMovement;
      } else {
        throw new BadRequestException(
          `El stock con ID ${stockMovement.stock} no existe!`,
        );
      }
    } catch (error) {
      if (error.status === 400) {
        throw new BadRequestException(error.response.message);
      }
      throw new InternalServerErrorException('Something terrible happen!!!');
    }
  }

  async findOneStockMovement(id: string): Promise<StockMovement> {
    try {
      const stockMovement = await this.stockMovementModel
        .findById(id)
        .populate('stock')
        .exec();

      if (stockMovement) {
        return stockMovement;
      } else {
        throw new BadRequestException(
          `El movimiento de stock con ID ${id} no existe!`,
        );
      }
    } catch (error) {
      if (error.status === 400) {
        throw new BadRequestException(error.response.message);
      }
      throw new BadRequestException('ID no valido');
    }
  }

  async findAllStockMovements(
    startDate: string,
    endDate: string,
    typeStockMovement: string,
  ): Promise<StockMovement[]> {
    try {
      const query: any = {};

      if (typeStockMovement) {
        query.type = typeStockMovement;
      }

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

  private updateStockQuantity(
    type: string,
    quantity: number,
    toCreateStockMovement: boolean,
    stock: Stock,
  ): number {
    switch (type) {
      case TypeStockMovementEnum.MERCHANDISE_ENTRY:
        if (!toCreateStockMovement && stock.quantity < quantity) {
          throw new BadRequestException(
            'Error: La cantidad en el stock es menor a la que se quiere retirar',
          );
        }
        return toCreateStockMovement
          ? stock.quantity + quantity
          : stock.quantity - quantity;

      case TypeStockMovementEnum.SALE:
        if (toCreateStockMovement && stock.quantity < quantity) {
          throw new BadRequestException(
            'Error: La cantidad en el stock es menor a la que se quiere retirar',
          );
        }
        return toCreateStockMovement
          ? stock.quantity - quantity
          : stock.quantity + quantity;

      default:
        throw new BadRequestException('Error: Opción invalida');
    }
  }
}
