import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const totalAmount = createSaleDto.quantity * createSaleDto.unitPrice;

    const sale = this.salesRepository.create({
      ...createSaleDto,
      totalAmount,
    });

    return this.salesRepository.save(sale);
  }

  async findAll(): Promise<Sale[]> {
    return this.salesRepository.find({
      relations: ['order', 'customer', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Sale> {
    const sale = await this.salesRepository.findOne({
      where: { id },
      relations: ['order', 'customer', 'product'],
    });

    if (!sale) {
      throw new NotFoundException(`Venda com ID ${id} não encontrada`);
    }

    return sale;
  }

  async update(id: number, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    const sale = await this.findOne(id);

    if (updateSaleDto.quantity !== undefined || updateSaleDto.unitPrice !== undefined) {
      const quantity = updateSaleDto.quantity ?? sale.quantity;
      const unitPrice = updateSaleDto.unitPrice ?? sale.unitPrice;
      updateSaleDto['totalAmount'] = quantity * unitPrice;
    }

    await this.salesRepository.update(id, updateSaleDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.salesRepository.delete(id);
  }

  async findByCustomer(customerId: number): Promise<Sale[]> {
    return this.salesRepository.find({
      where: { customer: { id: customerId } },
      relations: ['order', 'customer', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByProduct(productId: number): Promise<Sale[]> {
    return this.salesRepository.find({
      where: { product: { id: productId } },
      relations: ['order', 'customer', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<Sale[]> {
    return this.salesRepository.find({
      where: { status },
      relations: ['order', 'customer', 'product'],
      order: { createdAt: 'DESC' },
    });
  }
}
