import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { CancelStockMovementDto } from './dto/cancel-stock-movement.dto';

@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stocksService: StocksService) {}

  @Post()
  create(@Body() createStockMovemntDto: CreateStockMovementDto) {
    return this.stocksService.createStockMovement(createStockMovemntDto);
  }

  @Get()
  findAll(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('typeStockMovement') typeStockMovement: string,
  ) {
    return this.stocksService.findAllStockMovements(
      startDate,
      endDate,
      typeStockMovement,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() cancelStockMovementDto: CancelStockMovementDto,
  ) {
    return this.stocksService.cancelStockMovement(id, cancelStockMovementDto);
  }
}
