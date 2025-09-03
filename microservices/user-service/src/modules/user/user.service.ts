import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async getUserOrThrow(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async checkEmailAvailability(email: string, excludeUserId?: string) {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser && existingUser.id !== excludeUserId) {
      throw new ConflictException('Email is already registered');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.checkEmailAvailability(createUserDto.email);

    const user = this.userRepository.create({
      ...createUserDto,
      roles: createUserDto.roles || ['user'],
    });

    return this.userRepository.save(user);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ data: User[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const where = search
      ? [
          { name: Like(`%${search}%`) },
          { lastName: Like(`%${search}%`) },
          { email: Like(`%${search}%`) },
        ]
      : {};

    const [users, total] = await this.userRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<User> {
    return this.getUserOrThrow(id);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.getUserOrThrow(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      await this.checkEmailAvailability(updateUserDto.email, id);
    }

    if (updateUserDto.password) {
      delete updateUserDto.password;
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const user = await this.getUserOrThrow(id);
    await this.userRepository.remove(user);
    return { success: true };
  }

  async setActiveStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.getUserOrThrow(id);
    user.isActive = isActive;
    return this.userRepository.save(user);
  }

  async activate(id: string): Promise<User> {
    return this.setActiveStatus(id, true);
  }

  async deactivate(id: string): Promise<User> {
    return this.setActiveStatus(id, false);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLogin: new Date() });
  }
}
