import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CashRegistersService } from './cash-registers.service';
import { CreateCashRegisterDto } from './dto/create-cash-register.dto';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';

@Controller('cash-registers')
export class CashRegistersController {
  constructor(private readonly cashRegistersService: CashRegistersService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createCashRegisterDto: CreateCashRegisterDto) {
    return this.cashRegistersService.createCashRegister(createCashRegisterDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.cashRegistersService.findAllCashRegisters();
  }
}
