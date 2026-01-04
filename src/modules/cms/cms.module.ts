import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmsService } from './cms.service';
import { CmsController } from './cms.controller';
import { CmsPage } from './entities/cms.entity';
import { Banner } from './entities/banners.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CmsPage, Banner])],
  controllers: [CmsController],
  providers: [CmsService],
  exports: [CmsService],
})
export class CmsModule {}
