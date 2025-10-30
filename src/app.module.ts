import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Módulos da aplicação
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PricesModule } from './modules/prices/prices.module';
import { ProductsModule } from './modules/products/products.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { StockModule } from './modules/stock/stock.module';
import { UsersModule } from './modules/users/users.module';
import { CmsModule } from './modules/cms/cms.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { CartsModule } from './modules/carts/carts.module';
import { AuthModule } from './auth/auth.module';

// Configuração principal do banco
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true, //tirar isso quando for pra produção
    }),

    // Importa todos os módulos da aplicação
    AddressesModule,
    CartsModule,
    CustomersModule,
    OrdersModule,
    PricesModule,
    ProductsModule,
    PromotionsModule,
    StockModule,
    UsersModule,
    CmsModule,
    CategoriesModule,
    AuthModule,
  ],
})
export class AppModule {}
