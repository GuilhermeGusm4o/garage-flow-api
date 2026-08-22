import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatePartUseCase } from '@inventory/application/use-cases/create-part.use-case';
import { RestockPartUseCase } from '@inventory/application/use-cases/restock-part.use-case';
import { ConsumePartUseCase } from '@inventory/application/use-cases/consume-part.use-case';
import { ListPartsUseCase } from '@inventory/application/use-cases/list-parts.use-case';
import { UpdatePartUseCase } from '@inventory/application/use-cases/update-part.use-case';
import { SoftDeletePartUseCase } from '@inventory/application/use-cases/soft-delete-part.use-case';
import { CreatePartDto } from '@inventory/presentation/dtos/create-part.dto';
import { RestockPartDto } from '@inventory/presentation/dtos/restock-part.dto';
import { UpdatePartDto } from '@inventory/presentation/dtos/update-part.dto';
import { ConsumePartDto } from '@inventory/presentation/dtos/consume-part.dto';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly createPart: CreatePartUseCase,
    private readonly restockPart: RestockPartUseCase,
    private readonly consumePart: ConsumePartUseCase,
    private readonly listParts: ListPartsUseCase,
    private readonly updatePart: UpdatePartUseCase,
    private readonly softDeletePart: SoftDeletePartUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreatePartDto) {
    return this.createPart.execute(dto);
  }

  @Get()
  findAll() {
    return this.listParts.execute();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePartDto) {
    return this.updatePart.execute(id, dto);
  }

  @Patch(':id/restock')
  restock(@Param('id') id: string, @Body() dto: RestockPartDto) {
    return this.restockPart.execute(id, dto.quantity);
  }

  @Patch(':id/consume')
  consume(@Param('id') id: string, @Body() dto: ConsumePartDto) {
    return this.consumePart.execute(id, dto.quantity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.softDeletePart.execute(id);
  }
}
