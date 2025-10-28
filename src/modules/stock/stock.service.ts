import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Product } from 'src/modules/products/entities/product.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Cria um novo registro de estoque.
   */
  async create(createStockDto: CreateStockDto): Promise<Stock> {
    const { productId, quantity } = createStockDto;

    // Verifica se o produto existe
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Produto com ID ${productId} não encontrado.`);
    }

    // Verifica se o produto já possui estoque cadastrado
    const existingStock = await this.stockRepository.findOne({ where: { product: { id: productId } } });
    if (existingStock) {
      throw new BadRequestException('Este produto já possui um registro de estoque.');
    }

    const stock = this.stockRepository.create({
      product,
      quantity,
    });

    return await this.stockRepository.save(stock);
  }

  /**
   * Retorna todos os registros de estoque.
   */
  async findAll(): Promise<Stock[]> {
    return await this.stockRepository.find({
      relations: ['product'],
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * Retorna um registro de estoque específico.
   */
  async findOne(id: number): Promise<Stock> {
    const stock = await this.stockRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!stock) {
      throw new NotFoundException(`Estoque com ID ${id} não encontrado.`);
    }

    return stock;
  }

  /**
   * Atualiza a quantidade de um estoque existente.
   */
  async update(id: number, updateStockDto: UpdateStockDto): Promise<Stock> {
    const stock = await this.stockRepository.findOne({ where: { id }, relations: ['product'] });

    if (!stock) {
      throw new NotFoundException(`Estoque com ID ${id} não encontrado.`);
    }

    Object.assign(stock, updateStockDto);
    return await this.stockRepository.save(stock);
  }

  /**
   * Remove um registro de estoque.
   */
  async remove(id: number): Promise<void> {
    const stock = await this.stockRepository.findOne({ where: { id } });

    if (!stock) {
      throw new NotFoundException(`Estoque com ID ${id} não encontrado.`);
    }

    await this.stockRepository.remove(stock);
  }
}
