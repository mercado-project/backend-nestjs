import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Price } from './entities/price.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { CreatePriceDto } from './dto/create-price.dto';
import { UpdatePriceDto } from './dto/update-price.dto';

@Injectable()
export class PricesService {
  constructor(
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Cria um novo preço para um produto
   * Registra histórico de preços (não sobrescreve o anterior)
   */
  async create(createPriceDto: CreatePriceDto): Promise<Price> {
    const { productId, price } = createPriceDto;

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Produto com ID ${productId} não encontrado`);
    }

    if (price <= 0) {
      throw new BadRequestException('O preço deve ser maior que zero');
    }

    const newPrice = this.priceRepository.create({
      product,
      price,
    });

    return await this.priceRepository.save(newPrice);
  }

  /**
   * Retorna todos os preços cadastrados (com produto)
   */
  async findAll(): Promise<Price[]> {
    return this.priceRepository.find({
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Retorna um preço específico pelo ID
   */
  async findOne(id: number): Promise<Price> {
    const price = await this.priceRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!price) {
      throw new NotFoundException(`Preço com ID ${id} não encontrado`);
    }

    return price;
  }

  /**
   * Atualiza o valor do preço (sem mudar o produto vinculado)
   */
  async update(id: number, updatePriceDto: UpdatePriceDto): Promise<Price> {
    const price = await this.priceRepository.findOne({ where: { id } });
    if (!price) {
      throw new NotFoundException(`Preço com ID ${id} não encontrado`);
    }

    if (updatePriceDto.price !== undefined) {
      if (updatePriceDto.price <= 0) {
        throw new BadRequestException('O preço deve ser maior que zero');
      }
      price.price = updatePriceDto.price;
    }

    return await this.priceRepository.save(price);
  }

  /**
   * Remove um preço do histórico
   */
  async remove(id: number): Promise<{ message: string }> {
    const price = await this.priceRepository.findOne({ where: { id } });
    if (!price) {
      throw new NotFoundException(`Preço com ID ${id} não encontrado`);
    }

    await this.priceRepository.remove(price);

    return { message: `Preço com ID ${id} removido com sucesso` };
  }

  /**
   * Busca o preço mais recente de um produto
   */
  async findLatestByProductId(productId: number): Promise<Price> {
    const latestPrice = await this.priceRepository.findOne({
      where: { product: { id: productId } },
      order: { createdAt: 'DESC' },
      relations: ['product'],
    });

    if (!latestPrice) {
      throw new NotFoundException(`Nenhum preço encontrado para o produto ${productId}`);
    }

    return latestPrice;
  }
}
