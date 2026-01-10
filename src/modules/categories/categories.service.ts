import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { RedisService } from 'src/shared/redis/redis.service';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class CategoriesService {
  private readonly CACHE_KEY_ALL = 'categories:all';
  private readonly CACHE_KEY_MENU = 'categories:menu';
  private readonly CACHE_TTL = 60 * 30; // 30 minutos

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly redisService: RedisService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);
    const saved = await this.categoryRepository.save(category);

    // invalida cache
    await this.invalidateCategoriesCache();

    return saved;
  }

  async findAll(): Promise<Category[]> {
    // 1️⃣ tenta buscar do cache
    const cached = await this.redisService.get<Category[]>(this.CACHE_KEY_ALL);
    if (cached) {
      return cached;
    }

    // 2️⃣ busca do banco
    const categories = await this.categoryRepository.find({
      relations: ['parent'],
    });

    // 3️⃣ salva no cache por 30 minutos
    await this.redisService.set(this.CACHE_KEY_ALL, categories, this.CACHE_TTL);

    return categories;
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findMenuCategories(): Promise<Category[]> {
    // 1️⃣ tenta buscar do cache
    const cached = await this.redisService.get<Category[]>(
      this.CACHE_KEY_MENU,
    );

    if (cached) {
      return cached;
    }

    // 2️⃣ busca do banco
    const categories = await this.categoryRepository.find({
      where: { showInMenu: true },
      relations: ['children'],
      order: {
        id: 'ASC', // opcional, mas ajuda na consistência
      },
    });

    // 3️⃣ salva no cache
    await this.redisService.set(
      this.CACHE_KEY_MENU,
      categories,
      this.CACHE_TTL,
    );

    return categories;
  }


  async findByUrl(url: string): Promise<Category> {
    const cacheKey = `categories:url:${url}`;

    // 1️⃣ tenta buscar do cache
    const cached = await this.redisService.get<Category>(cacheKey);
    if (cached) {
      return cached;
    }

    // 2️⃣ busca do banco
    const category = await this.categoryRepository.findOne({
      where: { url },
      relations: ['parent', 'children'], // já deixo pronto pro front
    });

    if (!category) {
      throw new NotFoundException(`Category with URL '${url}' not found`);
    }

    // 3️⃣ salva no cache
    await this.redisService.set(cacheKey, category, this.CACHE_TTL);

    return category;
  }


  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    // 🔍 valida URL única (ignorando o próprio registro)
    if (updateCategoryDto.url) {
      const existing = await this.categoryRepository.findOne({
        where: { url: updateCategoryDto.url },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Já existe uma categoria com essa URL'
        );
      }
    }

    Object.assign(category, updateCategoryDto);

    const updated = await this.categoryRepository.save(category);

    // invalida cache
    await this.invalidateCategoriesCache();

    return updated;
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);

    // invalida cache
    await this.invalidateCategoriesCache();
  }


  private async invalidateCategoriesCache() {
    await Promise.all([
      this.redisService.del(this.CACHE_KEY_ALL),
      this.redisService.del(this.CACHE_KEY_MENU),
    ]);
  }


  async getAllDescendantCategoryIds(parentId: number): Promise<number[]> {
    const cacheKey = `categories:descendants:${parentId}`;

    // 1️⃣ tenta cache
    const cached = await this.redisService.get<number[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // 2️⃣ lógica atual (DFS)
    const stack = [parentId];
    const allIds = [parentId];

    while (stack.length > 0) {
      const currentId = stack.pop();

      const children = await this.categoryRepository.find({
        where: { parent: { id: currentId } },
        select: ['id'], // 🚀 performance
      });

      for (const child of children) {
        allIds.push(child.id);
        stack.push(child.id);
      }
    }

    // 3️⃣ salva no cache
    await this.redisService.set(
      cacheKey,
      allIds,
      this.CACHE_TTL, // 30 min
    );

    return allIds;
  }

}
