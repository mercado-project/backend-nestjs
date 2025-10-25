import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CmsService } from './cms.service';
import { CreateCmsDto } from './dto/create-cms.dto';
import { UpdateCmsDto } from './dto/update-cms.dto';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Post()
  create(@Body() createCmsDto: CreateCmsDto) {
    return this.cmsService.create(createCmsDto);
  }

  @Get()
  findAll() {
    return this.cmsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cmsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCmsDto: UpdateCmsDto) {
    return this.cmsService.update(+id, updateCmsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cmsService.remove(+id);
  }
}
