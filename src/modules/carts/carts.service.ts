import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Cria um novo carrinho para o cliente.
   */
  async create(createCartDto: CreateCartDto): Promise<Cart> {
    const customer = await this.customerRepository.findOne({
      where: { id: createCartDto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const cart = this.cartRepository.create({ customer });
    return await this.cartRepository.save(cart);
  }

  /**
   * Adiciona um item ao carrinho.
   */
  async addItem(createCartItemDto: CreateCartItemDto): Promise<CartItem> {
    const cart = await this.cartRepository.findOne({
      where: { id: createCartItemDto.cartId },
      relations: ['items'],
    });

    if (!cart) throw new NotFoundException('Carrinho não encontrado');

    const product = await this.productRepository.findOne({
      where: { id: createCartItemDto.productId },
    });

    if (!product) throw new NotFoundException('Produto não encontrado');

    // Verifica se o item já existe no carrinho
    const existingItem = await this.cartItemRepository.findOne({
      where: { cart: { id: cart.id }, product: { id: product.id } },
    });

    if (existingItem) {
      existingItem.quantity += createCartItemDto.quantity;
      return this.cartItemRepository.save(existingItem);
    }

    const cartItem = this.cartItemRepository.create({
      cart,
      product,
      quantity: createCartItemDto.quantity,
    });

    return await this.cartItemRepository.save(cartItem);
  }

  /**
   * Lista todos os carrinhos com seus itens.
   */
  async findAll(): Promise<Cart[]> {
    return this.cartRepository.find({
      relations: ['customer', 'items', 'items.product'],
    });
  }

  /**
   * Busca um carrinho específico.
   */
  async findOne(id: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id },
      relations: ['customer', 'items', 'items.product'],
    });

    if (!cart) throw new NotFoundException('Carrinho não encontrado');
    return cart;
  }

  /**
   * Atualiza informações básicas do carrinho (exemplo: trocar cliente).
   */
  async update(id: number, updateCartDto: UpdateCartDto): Promise<Cart> {
    const cart = await this.cartRepository.findOne({ where: { id } });
    if (!cart) throw new NotFoundException('Carrinho não encontrado');

    Object.assign(cart, updateCartDto);
    return await this.cartRepository.save(cart);
  }

  /**
   * Remove um carrinho e seus itens.
   */
  async remove(id: number): Promise<void> {
    const cart = await this.cartRepository.findOne({ where: { id } });
    if (!cart) throw new NotFoundException('Carrinho não encontrado');
    await this.cartRepository.remove(cart);
  }
}
