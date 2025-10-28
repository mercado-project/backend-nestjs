import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Customer } from 'src/modules/customers/entities/customer.entity';
import { Order } from 'src/modules/orders/entities/order.entity';

export enum AddressType {
  ENTREGA = 'entrega',
  COBRANCA = 'cobranca',
  TRABALHO = 'trabalho',
  PRINCIPAL = 'principal',
}

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ length: 150 })
  street: string;

  @Column({ length: 10 })
  number: string;

  @Column({ length: 100, nullable: true })
  complement?: string;

  @Column({ length: 100 })
  neighborhood: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 2 })
  state: string;

  @Column({ length: 8 })
  cep: string;

  @Column({
    type: 'enum',
    enum: AddressType,
  })
  type: AddressType;

  @OneToMany(() => Order, (order) => order.address)
  orders: Order[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

