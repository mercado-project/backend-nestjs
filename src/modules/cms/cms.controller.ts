import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CmsService } from './cms.service';
import { CreateCmsDto } from './dto/create-cms.dto';
import { UpdateCmsDto } from './dto/update-cms.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ========= BANNERS (SEMPRE PRIMEIRO) =========

  @Post('banners')
  createBanner(@Body() dto: CreateBannerDto) {
    return this.cmsService.createBanner(dto);
  }

  @Get('banners')
  findAllBanners() {
    return this.cmsService.findAllBanners();
  }

  @Get('banners/active')
  findActiveBanners() {
    return this.cmsService.findActiveBanners();
  }

  @Get('banners/:id')
  findBanner(@Param('id') id: string) {
    return this.cmsService.findBannerById(Number(id));
  }

  @Patch('banners/:id')
  updateBanner(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDto,
  ) {
    return this.cmsService.updateBanner(Number(id), dto);
  }

  @Delete('banners/:id')
  removeBanner(@Param('id') id: string) {
    return this.cmsService.removeBanner(Number(id));
  }

  // ========= CMS PAGES (GENÉRICO POR ÚLTIMO) =========

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
