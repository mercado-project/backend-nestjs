import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductImagesService } from './product-images.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly imagesService: ProductImagesService
  ) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get('search')
  search(@Query("w") w: string) {
    return this.productsService.search(w);
  }

  @Get()
  async findAll(
  @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return await this.productsService.findAll(parsedLimit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Get('url/:url')
  async getByUrl(@Param('url') url: string) {
    return this.productsService.findByUrl(url);
  }

  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string) {
    return await this.productsService.findByCategory(Number(categoryId));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  @Post('images')
  createImage(@Body() dto: CreateProductImageDto) {
    return this.imagesService.create(dto);
  }

  @Get('images/:productId')
  findProductByImage(@Param('productId') productId: number) {
    return this.imagesService.findByProductId(productId);
  }

  @Delete('images/:imageId')
  removeImage(@Param('imageId') imageId: number) {
    return this.imagesService.remove(imageId);
  }
}
