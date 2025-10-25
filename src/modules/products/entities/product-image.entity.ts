import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Product } from 'src/modules/products/entities/product.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ length: 255 })
  image_url: string;

  @Column({ type: 'boolean', default: false })
  is_main: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
