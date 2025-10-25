import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cms_pages')
export class CmsPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  title: string;

  @Column({ length: 150, unique: true })
  url: string;

  @Column('text')
  content: string;

  @Column({ length: 50, default: 'cms' })
  pageType: string;

  @Column({ length: 150 })
  metaTitle: string;

  @Column({ length: 255 })
  metaDescription: string;

  @Column({ length: 255, nullable: true })
  bannerImage: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

