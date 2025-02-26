import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './entities/product.entity';
import { Model } from 'mongoose';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const newProduct = new this.productModel(createProductDto);

      await newProduct.save();

      const product = newProduct.toJSON();

      return product;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          `El producto ${createProductDto.name} ya existe!`,
        );
      }
      throw new InternalServerErrorException('Something terrible happen!!!');
    }
  }

  async findAll(searchParam: string): Promise<Product[]> {
    try {
      return await this.productModel.find({
        $or: [
          { name: { $regex: searchParam } },
          { description: { $regex: searchParam } },
        ],
      });
    } catch (error) {
      throw new InternalServerErrorException('Something terrible happen!!!');
    }
  }

  async findOne(id: string): Promise<Product> {
    try {
      const product = await this.productModel.findById(id);

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
      const productToUpdate = await this.productModel.findById(id);

      if (productToUpdate) {
        await this.productModel.replaceOne({ _id: id }, updateProductDto);
        return await this.productModel.findById(id);
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

  async remove(id: string) {
    try {
      const productToDelete = await this.productModel.findById(id);

      if (productToDelete) {
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
