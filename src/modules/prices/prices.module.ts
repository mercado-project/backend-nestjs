import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricesService } from './prices.service';
import { PricesController } from './prices.controller';
import { Price } from './entities/price.entity';
import { Product } from 'src/modules/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Price, Product])],
  controllers: [PricesController],
  providers: [PricesService],
  exports: [PricesService],
})
export class PricesModule {}
