import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find({
      relations: ['parent'], // se tiver relação de categoria pai
    });
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

  async findMenuCategories() {
    return this.categoryRepository.find({
      where: { showInMenu: true },
      relations: ['children']
    });
  }

  async findByUrl(url: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { url },
      relations: ['parent'],
    });
  
    if (!category) {
      throw new NotFoundException(`Category with URL '${url}' not found`);
    }
  
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    Object.assign(category, updateCategoryDto);

    return await this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }


  async getAllDescendantCategoryIds(parentId: number): Promise<number[]> {
    const stack = [parentId];
    const allIds = [parentId];

    while (stack.length > 0) {
      const currentId = stack.pop();

      const children = await this.categoryRepository.find({
        where: { parent: { id: currentId } },
      });

      for (const child of children) {
        allIds.push(child.id);
        stack.push(child.id);
      }
    }

    return allIds;
  }

}
