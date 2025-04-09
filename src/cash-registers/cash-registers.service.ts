import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateCashRegisterDto } from './dto/create-cash-register.dto';
import { CashRegister } from './entities/cash-register.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StockMovement } from '../stocks/entities/stock-movement.entity';
import { TypeStockMovementEnum } from '../stocks/interfaces/type-stock-movement-enum.interface';
import { TypeCashRegisterEnum } from './interfaces/type-cash-register-enum.interface';
import { CashRegisterEntry } from './entities/cash-register-entry.entity';
import { Expense } from '../expenses/entities/expense.entity';

@Injectable()
export class CashRegistersService {
  constructor(
    @InjectModel(CashRegister.name)
    private cashRegisterModel: Model<CashRegister>,
    @InjectModel(CashRegisterEntry.name)
    private cashRegisterEntryModel: Model<CashRegisterEntry>,
  ) {}

  async createCashRegister(
    createCashRegisterDto: CreateCashRegisterDto,
  ): Promise<CashRegister> {
    try {
      const newCashRegister = new this.cashRegisterModel(createCashRegisterDto);

      await newCashRegister.save();

      const cashRegister = newCashRegister.toJSON();

      return cashRegister;
    } catch (error) {
      throw new InternalServerErrorException('Something terrible happen!!!');
    }
  }

  async findAllCashRegisters(): Promise<CashRegister[]> {
    try {
      return await this.cashRegisterModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Something terrible happen!!!');
    }
  }

  async findOneCashRegisterByType(type: string) {
    try {
      const cashRegister = await this.cashRegisterModel
        .findOne({ type: type })
        .exec();

      if (cashRegister) {
        return cashRegister;
      } else {
        throw new BadRequestException(`La caja no existe!`);
      }
    } catch (error) {
      if (error.status === 400) {
        throw new BadRequestException(error.response.message);
      }
      throw new BadRequestException('ID no valido');
    }
  }

  private async updatePettyCash(
    amount: number,
    movementType: string,
    toCreate: boolean | null,
  ) {
    const cashRegister = await this.findOneCashRegisterByType(
      TypeCashRegisterEnum.PETTY_CASH,
    );

    const amountToUpdate = Number(amount.toFixed(2));

    if (movementType === TypeCashRegisterEnum.CREDIT) {
      if (toCreate) {
        cashRegister.totalAmount += amountToUpdate;
      } else {
        cashRegister.totalAmount -= amountToUpdate;
      }
    }

    if (movementType === TypeCashRegisterEnum.DEBIT) {
      if (toCreate) {
        cashRegister.totalAmount -= amountToUpdate;
      } else {
        cashRegister.totalAmount += amountToUpdate;
      }
    }

    await this.cashRegisterModel.replaceOne(
      { _id: cashRegister._id },
      cashRegister,
    );
  }

  async createOrDeleteCashRegisterEntry(
    stockMovement: StockMovement | null,
    expense: Expense | null,
    toCreate: boolean | null,
  ) {
    try {
      if (stockMovement) {
        const TYPE_CASH_REGISTER =
          stockMovement.type === TypeStockMovementEnum.SALE
            ? TypeCashRegisterEnum.CREDIT
            : TypeCashRegisterEnum.DEBIT;
        const cashRegister = await this.findOneCashRegisterByType(
          TYPE_CASH_REGISTER,
        );

        if (toCreate) {
          const newCashRegisterEntry = this.generateCashregisterEntry(
            cashRegister,
            stockMovement,
            expense,
          );

          await newCashRegisterEntry.save();

          cashRegister.totalAmount += Number(
            newCashRegisterEntry.amount.toFixed(2),
          );

          await this.updatePettyCash(
            newCashRegisterEntry.amount,
            TYPE_CASH_REGISTER,
            toCreate,
          );
        } else {
          const cashRegisterEntryToDelete =
            await this.findOneCashRegisterEntryByStockMovementIdOrExpenseId(
              stockMovement._id!.toString(),
              null,
            );

          cashRegister.totalAmount -= cashRegisterEntryToDelete.amount;

          await this.removeCashRegisterEntry(
            cashRegisterEntryToDelete._id!.toString(),
          );

          await this.updatePettyCash(
            cashRegisterEntryToDelete.amount,
            TYPE_CASH_REGISTER,
            toCreate,
          );
        }

        await this.cashRegisterModel.replaceOne(
          { _id: cashRegister._id },
          cashRegister,
        );
      }

      if (expense) {
        const cashRegister = await this.findOneCashRegisterByType(
          TypeCashRegisterEnum.DEBIT,
        );

        if (toCreate) {
          const newCashRegisterEntry = this.generateCashregisterEntry(
            cashRegister,
            stockMovement,
            expense,
          );

          await newCashRegisterEntry.save();

          cashRegister.totalAmount += Number(
            newCashRegisterEntry.amount.toFixed(2),
          );

          await this.updatePettyCash(
            newCashRegisterEntry.amount,
            TypeCashRegisterEnum.DEBIT,
            toCreate,
          );
        } else {
          const cashRegisterEntryToDelete =
            await this.findOneCashRegisterEntryByStockMovementIdOrExpenseId(
              null,
              expense._id!.toString(),
            );

          cashRegister.totalAmount -= Number(
            cashRegisterEntryToDelete.amount.toFixed(2),
          );

          await this.removeCashRegisterEntry(
            cashRegisterEntryToDelete._id!.toString(),
          );

          await this.updatePettyCash(
            cashRegisterEntryToDelete.amount,
            TypeCashRegisterEnum.DEBIT,
            toCreate,
          );
        }

        await this.cashRegisterModel.replaceOne(
          { _id: cashRegister._id },
          cashRegister,
        );
      }
    } catch (error) {
      console.log({ GRAVE_ERROR: error });
      throw new InternalServerErrorException('Something terrible happen!!!');
    }
  }

  private async removeCashRegisterEntry(id: string) {
    try {
      return await this.cashRegisterEntryModel.deleteOne({ _id: id });
    } catch (error) {
      throw new BadRequestException('ID no valido');
    }
  }

  private async findOneCashRegisterEntryByStockMovementIdOrExpenseId(
    stockMovementId: string | null,
    expenseId: string | null,
  ) {
    try {
      const query = stockMovementId
        ? { stockMovementId: stockMovementId }
        : { expenseId: expenseId };

      const cashRegisterEntry = await this.cashRegisterEntryModel
        .findOne(query)
        .exec();

      if (cashRegisterEntry) {
        return cashRegisterEntry;
      } else {
        throw new BadRequestException(`La entrada no existe!`);
      }
    } catch (error) {
      if (error.status === 400) {
        throw new BadRequestException(error.response.message);
      }
      throw new BadRequestException('ID no valido');
    }
  }

  private generateCashregisterEntry(
    cashRegister: CashRegister,
    stockMovement: StockMovement | null,
    expense: Expense | null,
  ) {
    const newCashRegisterEntry: any = {
      cashRegisterId: cashRegister._id,
      description: stockMovement
        ? stockMovement.description
        : expense?.description,
      registerDate: stockMovement
        ? stockMovement.registerDate
        : expense?.registerDate,
      type: cashRegister.type,
      amount: stockMovement ? stockMovement.totalAmount : expense?.amount,
    };

    if (stockMovement) {
      newCashRegisterEntry.stockMovementId = stockMovement._id;
    } else {
      newCashRegisterEntry.expenseId = expense!._id;
    }

    return new this.cashRegisterEntryModel(newCashRegisterEntry);
  }
}
