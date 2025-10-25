import { Injectable } from '@nestjs/common';
import { CreateCmsDto } from './dto/create-cms.dto';
import { UpdateCmsDto } from './dto/update-cms.dto';

@Injectable()
export class CmsService {
  create(createCmsDto: CreateCmsDto) {
    return 'This action adds a new cm';
  }

  findAll() {
    return `This action returns all cms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cm`;
  }

  update(id: number, updateCmsDto: UpdateCmsDto) {
    return `This action updates a #${id} cm`;
  }

  remove(id: number) {
    return `This action removes a #${id} cm`;
  }
}
