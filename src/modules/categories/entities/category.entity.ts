import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => Category, (category) => category.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @Column({ type: 'int', default: 0 })
  level: number;

  @Column({ default: true })
  showInMenu: boolean;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ length: 150, unique: true })
  url: string;

  @Column({ length: 150 })
  meta_title: string;

  @Column({ length: 255 })
  meta_description: string;

  @Column({ length: 50, default: 'category' })
  page_type: string;

  @Column({ length: 255, nullable: true })
  image_url?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

