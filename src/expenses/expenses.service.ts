import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CashRegistersService } from '../cash-registers/cash-registers.service';
import { InjectModel } from '@nestjs/mongoose';
import { Expense } from './entities/expense.entity';
import { Model } from 'mongoose';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    private readonly cashRegistersService: CashRegistersService,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    try {
      const TO_CREATE_EXPENSE = true;
      const stockMovement = null;
      const newExpense = new this.expenseModel({
        ...createExpenseDto,
        registerDate: new Date(createExpenseDto.registerDate),
      });

      await newExpense.save();

      const expense = newExpense.toJSON();

      await this.cashRegistersService.createOrDeleteCashRegisterEntry(
        stockMovement,
        expense,
        TO_CREATE_EXPENSE,
      );

      return expense;
    } catch (error) {
      throw new InternalServerErrorException('Something terrible happen!!!');
    }
  }

  async findAll(): Promise<Expense[]> {
    try {
      return await this.expenseModel.find().sort({ registerDate: -1 }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Something terrible happen!!!');
    }
  }

  async remove(id: string) {
    try {
      const TO_CREATE_EXPENSE = false;
      const stockMovement = null;
      const expenseToDelete = await this.expenseModel.findById(id).exec();

      if (expenseToDelete) {
        await this.cashRegistersService.createOrDeleteCashRegisterEntry(
          stockMovement,
          expenseToDelete,
          TO_CREATE_EXPENSE,
        );

        return await this.expenseModel.deleteOne({ _id: id });
      } else {
        throw new BadRequestException(`El gasto con ID ${id} no existe!`);
      }
    } catch (error) {
      if (error.status === 400) {
        throw new BadRequestException(error.response.message);
      }
      throw new BadRequestException('ID no valido');
    }
  }
}
