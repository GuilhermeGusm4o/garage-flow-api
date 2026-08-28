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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePartUseCase } from '@inventory/application/use-cases/create-part.use-case';
import { RestockPartUseCase } from '@inventory/application/use-cases/restock-part.use-case';
import { ConsumePartUseCase } from '@inventory/application/use-cases/consume-part.use-case';
import { ListPartsUseCase } from '@inventory/application/use-cases/list-parts.use-case';
import { ListLowStockPartsUseCase } from '@inventory/application/use-cases/list-low-stock-parts.use-case';
import { UpdatePartUseCase } from '@inventory/application/use-cases/update-part.use-case';
import { SoftDeletePartUseCase } from '@inventory/application/use-cases/soft-delete-part.use-case';
import { CreatePartDto } from '@inventory/presentation/dtos/create-part.dto';
import { RestockPartDto } from '@inventory/presentation/dtos/restock-part.dto';
import { UpdatePartDto } from '@inventory/presentation/dtos/update-part.dto';
import { ConsumePartDto } from '@inventory/presentation/dtos/consume-part.dto';
import { LowStockPartResponseDto } from '@inventory/presentation/dtos/low-stock-part-response.dto';
import { JwtAuthGuard } from '@auth/infrastructure/security/jwt-auth.guard';
import { Roles } from '@auth/infrastructure/security/roles.decorator';
import { RolesGuard } from '@auth/infrastructure/security/roles.guard';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly createPart: CreatePartUseCase,
    private readonly restockPart: RestockPartUseCase,
    private readonly consumePart: ConsumePartUseCase,
    private readonly listParts: ListPartsUseCase,
    private readonly listLowStockParts: ListLowStockPartsUseCase,
    private readonly updatePart: UpdatePartUseCase,
    private readonly softDeletePart: SoftDeletePartUseCase,
  ) {}

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STOCK_CLERK')
  @ApiOperation({
    summary: 'Creates a new inventory item',
  })
  @ApiCreatedResponse({ description: 'Inventory item created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid inventory item payload' })
  create(@Body() dto: CreatePartDto) {
    return this.createPart.execute(dto);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'List all inventory items',
  })
  @ApiOkResponse({ description: 'Inventory items returned successfully' })
  findAll() {
    return this.listParts.execute();
  }

  @Get('low-stock')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STOCK_CLERK')
  @ApiOperation({
    summary: 'Lists inventory items whose logical stock is below the configured minimum',
    description:
      'Logical stock subtracts from the physical quantity everything already committed to ' +
      'service orders that are still open (RECEIVED, IN_DIAGNOSIS, AWAITING_APPROVAL, IN_EXECUTION).',
  })
  @ApiOkResponse({ type: [LowStockPartResponseDto] })
  async findLowStock(): Promise<LowStockPartResponseDto[]> {
    const lowStockParts = await this.listLowStockParts.execute();
    return lowStockParts.map(LowStockPartResponseDto.fromStockLevel);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STOCK_CLERK')
  @ApiOperation({
    summary: 'Updates an inventory item by ID',
  })
  @ApiOkResponse({ description: 'Inventory item updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid inventory item payload' })
  @ApiNotFoundResponse({ description: 'Inventory item not found' })
  update(@Param('id') id: string, @Body() dto: UpdatePartDto) {
    return this.updatePart.execute(id, dto);
  }

  @Patch(':id/restock')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STOCK_CLERK')
  @ApiOperation({
    summary: 'Adds quantity to an inventory item',
  })
  @ApiOkResponse({ description: 'Inventory item restocked successfully' })
  @ApiBadRequestResponse({ description: 'Invalid restock quantity' })
  @ApiNotFoundResponse({ description: 'Inventory item not found' })
  restock(@Param('id') id: string, @Body() dto: RestockPartDto) {
    return this.restockPart.execute(id, dto.quantity);
  }

  @Patch(':id/consume')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STOCK_CLERK')
  @ApiOperation({
    summary: 'Consumes quantity from an inventory item',
  })
  @ApiOkResponse({ description: 'Inventory item consumed successfully' })
  @ApiBadRequestResponse({ description: 'Invalid quantity or insufficient stock' })
  @ApiNotFoundResponse({ description: 'Inventory item not found' })
  consume(@Param('id') id: string, @Body() dto: ConsumePartDto) {
    return this.consumePart.execute(id, dto.quantity);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletes an inventory item by ID',
  })
  @ApiNoContentResponse({ description: 'Inventory item deleted successfully' })
  @ApiNotFoundResponse({ description: 'Inventory item not found' })
  remove(@Param('id') id: string) {
    return this.softDeletePart.execute(id);
  }
}
