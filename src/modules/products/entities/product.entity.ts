import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Category } from 'src/modules/categories/entities/category.entity';
import { ProductImage } from './product-image.entity';
import { Price } from 'src/modules/prices/entities/price.entity';
import { Promotion } from 'src/modules/promotions/entities/promotion.entity';
import { Stock } from 'src/modules/stock/entities/stock.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => Category, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ length: 50, unique: true })
  sku: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ length: 150, unique: true })
  url: string;

  @Column({ length: 150 })
  brand: string;

  @Column({ length: 150 })
  meta_title: string;

  @Column({ length: 255 })
  meta_description: string;

  @Column({ length: 50, default: 'product' })
  page_type: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @OneToMany(() => Price, (price) => price.product)
  prices: Price[];

  @OneToMany(() => Promotion, (promotion) => promotion.product)
  promotions: Promotion[];

  @OneToMany(() => Stock, (stock) => stock.product)
  stocks: Stock[];
}

