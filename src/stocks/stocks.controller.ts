import { Controller, Get, Query } from '@nestjs/common';
import { StocksService } from './stocks.service';

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get()
  findAll(
    @Query('query') query: string,
    @Query('size') size: string,
    @Query('color') color: string,
  ) {
    return this.stocksService.findAllStocks({ query, size, color });
  }
}
