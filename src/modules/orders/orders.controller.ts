import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderItemDto } from './dto/create-order-item.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Cria um novo pedido com seus itens
   * Exemplo de body esperado:
   * {
   *   "order": {
   *     "customerId": 1,
   *     "deliveryAddressId": 2,
   *     "paymentMethod": "pix",
   *     "status": "pending"
   *   },
   *   "items": [
   *     { "productId": 3, "quantity": 2 },
   *     { "productId": 4, "quantity": 1 }
   *   ]
   * }
   */
  @Post()
  async create(
    @Body('order') createOrderDto: CreateOrderDto,
    @Body('items') items: CreateOrderItemDto[],
  ) {
    return this.ordersService.create(createOrderDto, items);
  }

  /**
   * Lista pedidos com paginação e busca opcional
   * /orders?page=1&limit=10&search=joao&status=pending
   */
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
    @Query('status') status?: string,
  ) {
    // pagination and filtering handled manually in service
    const result = await this.ordersService.findAllWithPagination({
      page: +page,
      limit: +limit,
      search,
      status,
    });
    return result;
  }

  /**
   * Retorna um pedido específico
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  /**
   * Lista pedidos de um cliente específico
   * /orders/customer/1
   */
  @Get('customer/:customerId')
  async findByCustomer(
    @Param('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.ordersService.findByCustomerId(customerId);
  }

  /**
   * Atualiza o status de um pedido
   * PATCH /orders/:id
   * Body: { "status": "paid" }
   */
  @Patch(':id')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.ordersService.updateStatus(id, status);
  }

  /**
   * Exclui um pedido
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}
