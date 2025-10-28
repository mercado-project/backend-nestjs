import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CmsPage } from './entities/cms.entity';
import { CreateCmsDto } from './dto/create-cms.dto';
import { UpdateCmsDto } from './dto/update-cms.dto';

@Injectable()
export class CmsService {
  constructor(
    @InjectRepository(CmsPage)
    private readonly cmsRepository: Repository<CmsPage>,
  ) {}

  async create(createCmsDto: CreateCmsDto): Promise<CmsPage> {
    const existingPage = await this.cmsRepository.findOne({
      where: { url: createCmsDto.url },
    });
    if (existingPage) {
      throw new ConflictException('A page with this URL already exists.');
    }

    const page = this.cmsRepository.create(createCmsDto);
    return await this.cmsRepository.save(page);
  }

  async findAll(): Promise<CmsPage[]> {
    return await this.cmsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<CmsPage> {
    const page = await this.cmsRepository.findOne({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found.`);
    }
    return page;
  }

  async update(id: number, updateCmsDto: UpdateCmsDto): Promise<CmsPage> {
    const page = await this.findOne(id);

    // Se o usuário tentar alterar a URL, verifica se a nova já existe
    if (updateCmsDto.url && updateCmsDto.url !== page.url) {
      const existing = await this.cmsRepository.findOne({
        where: { url: updateCmsDto.url },
      });
      if (existing) {
        throw new ConflictException('A page with this new URL already exists.');
      }
    }

    Object.assign(page, updateCmsDto);
    return await this.cmsRepository.save(page);
  }

  async remove(id: number): Promise<void> {
    const page = await this.findOne(id);
    await this.cmsRepository.remove(page);
  }
}
