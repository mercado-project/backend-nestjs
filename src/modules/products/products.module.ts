import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Category } from 'src/modules/categories/entities/category.entity';
import { Price } from 'src/modules/prices/entities/price.entity';
import { Promotion } from 'src/modules/promotions/entities/promotion.entity';
import { Stock } from 'src/modules/stock/entities/stock.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductImage,
      Category,
      Price,
      Promotion,
      Stock,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
