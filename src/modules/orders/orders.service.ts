import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { Customer } from 'src/modules/customers/entities/customer.entity';
import { Address } from 'src/modules/addresses/entities/address.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { Price } from 'src/modules/prices/entities/price.entity';

interface PaginationQuery {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
  ) { }

  /**
   * Cria um novo pedido e seus itens
   */
  async create(
    createOrderDto: CreateOrderDto,
    items: CreateOrderItemDto[],
  ): Promise<Order> {
    const { customerId, deliveryAddressId, paymentMethod, status, shippingFee } = createOrderDto;

    // Valida cliente
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException(`Cliente com ID ${customerId} não encontrado`);
    }

    // Valida endereço (se informado) — atribui explicitamente antes de usar
    let address: Address | undefined = undefined;
    if (deliveryAddressId !== undefined && deliveryAddressId !== null) {
      const found = await this.addressRepository.findOne({
        where: { id: deliveryAddressId },
      });
      if (!found) {
        throw new NotFoundException(
          `Endereço com ID ${deliveryAddressId} não encontrado`,
        );
      }
      address = found;
    }

    // Agora que customer e address (se houver) estão resolvidos, cria o pedido
    const order = this.orderRepository.create({
      customer,
      address: address ?? undefined, // passa undefined quando não houver endereço
      orderDate: new Date(),
      totalAmount: 0, // será calculado pelos itens abaixo
      paymentMethod,
      status,
      shippingFee
    });

    const savedOrder = await this.orderRepository.save(order);

    // Cria itens e calcula total
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.product },
      });

      if (!product) {
        throw new NotFoundException(
          `Produto com ID ${item.product} não encontrado`,
        );
      }

      // Pega preço mais recente na tabela prices
      const latestPrice = await this.priceRepository.findOne({
        where: { product: { id: product.id } },
        order: { createdAt: 'DESC' },
      });

      if (!latestPrice) {
        throw new BadRequestException(
          `Produto ${product.name} não possui preço cadastrado`,
        );
      }

      const unitPrice = Number(latestPrice.price);
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      const orderItem = this.orderItemRepository.create({
        order: savedOrder,
        product,
        quantity: item.quantity,
        unitPrice,
      });
      orderItems.push(orderItem);
    }

    // Salva itens e atualiza total do pedido
    await this.orderItemRepository.save(orderItems);
    savedOrder.totalAmount = totalAmount;
    await this.orderRepository.save(savedOrder);

    // Busca o pedido completo com relacionamentos
    const orderWithRelations = await this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['customer', 'address', 'items', 'items.product'],
    });

    if (!orderWithRelations) {
      throw new NotFoundException(`Erro ao carregar o pedido criado (ID ${savedOrder.id})`);
    }

    return orderWithRelations;
  }


  /**
   * Lista pedidos com paginação, busca e filtro por status e data
   */
  async findAllWithPagination({
    page,
    limit,
    search,
    status,
    startDate,
    endDate,
  }: PaginationQuery): Promise<{ data: Order[]; total: number }> {
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product');

    if (search) {
      qb.where('customer.full_name ILIKE :search', { search: `%${search}%` });
    }

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      qb.andWhere('order.orderDate >= :startDate', { startDate: start });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      qb.andWhere('order.orderDate <= :endDate', { endDate: end });
    }

    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('order.orderDate', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  /**
   * Busca um pedido por ID
   */
  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'address', 'items', 'items.product'],
    });

    if (!order)
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);

    return order;
  }

  /**
   * Atualiza o status de um pedido
   */
  async updateStatus(id: number, status: string): Promise<Order> {
    const order = await this.findOne(id);

    // Valida se o status é válido
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'canceled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Status inválido. Status válidos: ${validStatuses.join(', ')}`,
      );
    }

    order.status = status;
    const updatedOrder = await this.orderRepository.save(order);

    // Retorna o pedido completo com relacionamentos
    return this.findOne(id);
  }

  /**
   * Remove um pedido
   */
  async remove(id: number): Promise<{ message: string }> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
    return { message: `Pedido ${id} removido com sucesso` };
  }


  async findByCustomerId(customerId: number): Promise<Order[]> {
    // valida se o cliente existe (boa prática)
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(
        `Cliente com ID ${customerId} não encontrado`,
      );
    }

    const orders = await this.orderRepository.find({
      where: {
        customer: { id: customerId },
      },
      relations: [
        'customer',
        'address',
        'items',
        'items.product',
      ],
      order: {
        orderDate: 'DESC', // mais recente primeiro
      },
    });

    if (!orders.length) {
      throw new NotFoundException(
        `Nenhum pedido encontrado para o cliente ID ${customerId}`,
      );
    }

    return orders;
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Vendas de hoje
    const todaySales = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.status = :status', { status: 'paid' })
      .andWhere('order.orderDate >= :today', { today })
      .select('COUNT(order.id)', 'count')
      .addSelect('SUM(order.totalAmount)', 'total')
      .getRawOne();

    // Vendas do mês
    const monthSales = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.status = :status', { status: 'paid' })
      .andWhere('order.orderDate >= :firstDayOfMonth', { firstDayOfMonth })
      .select('COUNT(order.id)', 'count')
      .addSelect('SUM(order.totalAmount)', 'total')
      .getRawOne();

    return {
      today: {
        count: Number(todaySales.count || 0),
        total: Number(todaySales.total || 0),
      },
      month: {
        count: Number(monthSales.count || 0),
        total: Number(monthSales.total || 0),
      },
    };
  }
}


