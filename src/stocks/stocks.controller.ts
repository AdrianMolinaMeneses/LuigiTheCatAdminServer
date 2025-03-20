import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Query('query') query: string,
    @Query('size') size: string,
    @Query('color') color: string,
  ) {
    return this.stocksService.findAllStocks({ query, size, color });
  }
}
