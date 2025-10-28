import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Address } from '../addresses/entities/address.entity';
import { Product } from '../products/entities/product.entity';
import { Price } from '../prices/entities/price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Customer, Address, Product, Price])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
