import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stocksService: StocksService) {}

  @Post()
  create(@Body() createStockMovemntDto: CreateStockMovementDto) {
    console.log(createStockMovemntDto);
    return this.stocksService.createStockMovement(createStockMovemntDto);
  }

  @Get()
  findAll(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    console.log({ startDate, endDate });
    return this.stocksService.findAllStockMovements(startDate, endDate);
  }
}
