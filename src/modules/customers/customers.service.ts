import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { FindCustomersDto } from './dto/find-customers.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly usersService: UsersService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const { email, password, ...customerData } = createCustomerDto;

    // Criar o cliente primeiro
    const customer = this.customerRepository.create(customerData);
    const savedCustomer = await this.customerRepository.save(customer);

    // Se email e password foram fornecidos, criar o usuário associado
    if (email && password) {
      try {
        await this.usersService.create({
          email,
          password,
          customerId: savedCustomer.id,
          role: UserRole.CUSTOMER,
        });
      } catch (error) {
        // Se falhar ao criar usuário, deletar o cliente criado
        await this.customerRepository.delete(savedCustomer.id);
        throw new BadRequestException('Erro ao criar usuário associado ao cliente');
      }
    }

    // Retornar o cliente com as relações carregadas
    const result = await this.customerRepository.findOne({
      where: { id: savedCustomer.id },
      relations: ['user'],
    });

    if (!result) {
      throw new BadRequestException('Erro ao recuperar cliente criado');
    }

    return result;
  }

  async findAll(query: FindCustomersDto): Promise<{ data: Customer[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search || '';

    const qb = this.customerRepository.createQueryBuilder('customer');

    if (search) {
      qb.where('customer.full_name LIKE :search OR customer.cpf LIKE :search', { search: `%${search}%` });
    }

    qb.orderBy('customer.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    // Carregar as relações de user separadamente
    const dataWithUser = await Promise.all(
      data.map(async (customer) => {
        const customerWithUser = await this.customerRepository.findOne({
          where: { id: customer.id },
          relations: ['user'],
        });
        return customerWithUser || customer;
      })
    );

    return { data: dataWithUser, total };
  }


  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, updateCustomerDto);
    return await this.customerRepository.save(customer);
  }

  async remove(id: number): Promise<void> {
    const result = await this.customerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
  }
}

