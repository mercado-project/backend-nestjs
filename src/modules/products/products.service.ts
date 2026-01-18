import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from 'src/modules/categories/entities/category.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoriesService } from '../categories/categories.service'
import { Repository, In, ILike } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,

    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const {
      name,
      description,
      categoryId,
      sku,
      active = true,
      url,
      brand,
      meta_title,
      meta_description,
      page_type = 'product',
    } = createProductDto;

    // resolve category se informado
    let category: Category | undefined = undefined;
    if (categoryId !== undefined && categoryId !== null) {
      const found = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!found) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }
      category = found;
    }

    // checa SKU duplicado
    const existingSku = await this.productRepository.findOne({ where: { sku } });
    if (existingSku) {
      throw new BadRequestException(`SKU '${sku}' is already in use`);
    }

    // cria o product; passe category como undefined quando não existir
    const product = this.productRepository.create({
      name,
      description,
      category: category ?? undefined,
      sku,
      active,
      url,
      brand,
      meta_title,
      meta_description,
      page_type,
    });

    return await this.productRepository.save(product);
  }

  async findAll(limit?: number): Promise<Product[]> {
    return await this.productRepository.find({
      take: limit, // undefined = pega tudo
      order: { createdAt: 'DESC' },
      relations: ['category', 'images', 'prices', 'promotions', 'stocks'],
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'images', 'prices', 'promotions', 'stocks'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findByUrl(url: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { url },
      relations: ['category', 'images', 'prices', 'promotions', 'stocks'],
    });

    if (!product) {
      throw new NotFoundException(`Product with URL '${url}' not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);


      /* -------------------- */
      /* Validate SKU unique  */
      /* -------------------- */
      if (
        updateProductDto.sku &&
        updateProductDto.sku !== product.sku
      ) {
        const skuExists = await this.productRepository.findOne({
          where: { sku: updateProductDto.sku },
        });

        if (skuExists && skuExists.id !== product.id) {
          throw new BadRequestException(
            `SKU '${updateProductDto.sku}' já está em uso`
          );
        }
      }

      /* -------------------- */
      /* Validate URL unique  */
      /* -------------------- */
      if (
        updateProductDto.url &&
        updateProductDto.url !== product.url
      ) {
        const urlExists = await this.productRepository.findOne({
          where: { url: updateProductDto.url },
        });

        if (urlExists && urlExists.id !== product.id) {
          throw new BadRequestException(
            `URL '${updateProductDto.url}' já está em uso`
          );
        }
      }



    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${updateProductDto.categoryId} not found`);
      }

      product.category = category;
    }

    Object.assign(product, updateProductDto);

    return await this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    // Verifica se a categoria existe
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Busca IDs de todas as subcategorias recursivamente
    const categoryIds = await this.categoriesService.getAllDescendantCategoryIds(categoryId);

    // Busca produtos pertencentes a qualquer uma dessas categorias
    return await this.productRepository.find({
      where: { category: { id: In(categoryIds) } },
      relations: ['category', 'images', 'prices', 'promotions', 'stocks'],
      order: { createdAt: 'DESC' },
    });
  }

  async search(term: string): Promise<Product[]> {
    if (!term || term.trim().length < 2) {
      return [];
    }

    return this.productRepository.find({
      where: [
        { name: ILike(`%${term}%`) },
        { description: ILike(`%${term}%`) },
        { sku: ILike(`%${term}%`) },
        { brand: ILike(`%${term}%`) },
      ],
      relations: ['category', 'images', 'prices', 'promotions', 'stocks'],
      take: 50,
      order: { createdAt: 'DESC' },
    });
  }

}
