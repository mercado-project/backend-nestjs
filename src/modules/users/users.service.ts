import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, customerId, ...userdata } = createUserDto;
    const user = this.userRepository.create({
      ...userdata,
      passwordHash: password,
    });
    
    // Se customerId foi fornecido, atribuir à relação
    if (customerId) {
      user.customer = { id: customerId } as any;
    }
    
    const savedUser = await this.userRepository.save(user);
    
    // Retornar o usuário com a relação customer carregada
    const userWithCustomer = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['customer'],
    });
    
    if (!userWithCustomer) {
      throw new NotFoundException(`User with ID ${savedUser.id} not found`);
    }
    
    return userWithCustomer;
  }

  async findAll(): Promise<User[]> {
        return await this.userRepository.find({
      relations: ['customer'], // se tiver relação de categoria pai
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['customer'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email }
    });

    if (!user) {
      throw new NotFoundException(`User with EMAIL ${email} not found`);
    }

    return user;
  }


  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}


