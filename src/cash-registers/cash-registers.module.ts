import { Module } from '@nestjs/common';
import { CashRegistersService } from './cash-registers.service';
import { CashRegistersController } from './cash-registers.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CashRegister,
  CashRegisterSchema,
} from './entities/cash-register.entity';
import {
  CashRegisterEntry,
  CashRegisterEntrySchema,
} from './entities/cash-register-entry.entity';

@Module({
  controllers: [CashRegistersController],
  providers: [CashRegistersService],
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: CashRegister.name,
        schema: CashRegisterSchema,
      },
      {
        name: CashRegisterEntry.name,
        schema: CashRegisterEntrySchema,
      },
    ]),
  ],
  exports: [CashRegistersService],
})
export class CashRegistersModule {}
