import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductImage } from './entities/product-image.entity';
import { Product } from './entities/product.entity';
import { CreateProductImageDto } from './dto/create-product-image.dto';

@Injectable()
export class ProductImagesService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(dto: CreateProductImageDto) {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product ${dto.productId} not found`);
    }

    // Se marcar imagem como principal, limpa outras principais
    if (dto.is_main) {
      await this.imageRepository.update(
        { product: { id: dto.productId } },
        { is_main: false }
      );
    }

    const image = this.imageRepository.create({
      product,
      image_url: dto.image_url,
      is_main: dto.is_main ?? false,
    });

    return this.imageRepository.save(image);
  }

  async findByProductId(productId: number) {
    return this.imageRepository.find({
      where: { product: { id: productId } },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(imageId: number) {
    const image = await this.imageRepository.findOne({ where: { id: imageId } });

    if (!image) {
      throw new NotFoundException(`Image ${imageId} not found`);
    }

    return this.imageRepository.remove(image);
  }
}
