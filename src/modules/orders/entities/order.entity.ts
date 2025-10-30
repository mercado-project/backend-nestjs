import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Customer } from 'src/modules/customers/entities/customer.entity';
import { Address } from 'src/modules/addresses/entities/address.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Address, (address) => address.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'delivery_address_id' })
  address: Address;

  @Column({ type: 'timestamp', name: 'order_date' })
  orderDate: Date;

  @Column('decimal', { precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'shipped', 'delivered', 'canceled'],
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['card', 'pix', 'boleto'],
    name: 'payment_method',
  })
  paymentMethod: string;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];
}

