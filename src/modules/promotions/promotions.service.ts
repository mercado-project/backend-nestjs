import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { Product } from 'src/modules/products/entities/product.entity';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionsRepository: Repository<Promotion>,

    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    const { productId, promotionalPrice, startAt, endAt, active } =
      createPromotionDto;

    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Produto com ID ${productId} não encontrado`);
    }

    if (new Date(startAt) >= new Date(endAt)) {
      throw new BadRequestException(
        'A data de início deve ser anterior à data de término',
      );
    }

    const promotion = this.promotionsRepository.create({
      product,
      promotionalPrice,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      active,
    });

    return await this.promotionsRepository.save(promotion);
  }

  async findAll(): Promise<Promotion[]> {
    return await this.promotionsRepository.find({
      relations: ['product'],
      order: { startAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Promotion> {
    const promotion = await this.promotionsRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!promotion) {
      throw new NotFoundException(`Promoção com ID ${id} não encontrada`);
    }

    return promotion;
  }

  async update(
    id: number,
    updatePromotionDto: UpdatePromotionDto,
  ): Promise<Promotion> {
    const promotion = await this.findOne(id);

    if (updatePromotionDto.productId) {
      const product = await this.productsRepository.findOne({
        where: { id: updatePromotionDto.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Produto com ID ${updatePromotionDto.productId} não encontrado`,
        );
      }
      promotion.product = product;
    }

    Object.assign(promotion, updatePromotionDto);

    if (
      promotion.startAt &&
      promotion.endAt &&
      new Date(promotion.startAt) >= new Date(promotion.endAt)
    ) {
      throw new BadRequestException(
        'A data de início deve ser anterior à data de término',
      );
    }

    return await this.promotionsRepository.save(promotion);
  }

  async remove(id: number): Promise<{ message: string }> {
    const promotion = await this.findOne(id);
    await this.promotionsRepository.remove(promotion);
    return { message: `Promoção com ID ${id} removida com sucesso` };
  }
}
