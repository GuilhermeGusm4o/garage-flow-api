import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatePartUseCase } from '../application/use-cases/create-part.use-case';
import { RestockPartUseCase } from '../application/use-cases/restock-part.use-case';
import { ListPartsUseCase } from '../application/use-cases/list-parts.use-case';
import { CreatePartDto } from './dtos/create-part.dto';
import { RestockPartDto } from './dtos/restock-part.dto';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly createPart: CreatePartUseCase,
    private readonly restockPart: RestockPartUseCase,
    private readonly listParts: ListPartsUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreatePartDto) {
    return this.createPart.execute(dto);
  }

  @Get()
  findAll() {
    return this.listParts.execute();
  }

  @Patch(':id/restock')
  restock(@Param('id') id: string, @Body() dto: RestockPartDto) {
    return this.restockPart.execute(id, dto.quantity);
  }
}
