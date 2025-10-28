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
  ) {}

  /**
   * Cria um novo pedido e seus itens
   */
  async create(
    createOrderDto: CreateOrderDto,
    items: CreateOrderItemDto[],
  ): Promise<Order> {
    const { customerId, deliveryAddressId, paymentMethod, status } = createOrderDto;

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
    });

    const savedOrder = await this.orderRepository.save(order);

    // Cria itens e calcula total
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `Produto com ID ${item.productId} não encontrado`,
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
   * Lista pedidos com paginação, busca e filtro por status
   */
  async findAllWithPagination({
    page,
    limit,
    search,
    status,
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
   * Remove um pedido
   */
  async remove(id: number): Promise<{ message: string }> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
    return { message: `Pedido ${id} removido com sucesso` };
  }
}
