import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole } from 'src/domain/enums/user-role.enum';
import { UserRepository } from '../database/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getCredits(userId: string) {
    const user = await this.userRepository.findById(userId);
    return { credits: user?.credits ?? 0 };
  }

  async findById(userId: string): Promise<UserEntity | null> {
    return await this.userRepository.findById(userId);
  }

  async upgradePlan(userId: string, newPlan: 'CREATOR' | 'PRO') {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const planCredits = {
      CREATOR: 150,
      PRO: 1100,
    };

    const creditsToAdd = planCredits[newPlan];

    user.role = newPlan as UserRole;
    user.credits += creditsToAdd;

    await this.userRepository.save(user);

    return {
      message: 'Plan actualizado correctamente',
      newCredits: user.credits,
      plan: user.role,
    };
  }
  async save(user: UserEntity): Promise<UserEntity> {
    return await this.userRepository.save(user);
  }
  async setCredits(userId: string, credits: number) {
    const user = await this.userRepository.findById(userId);
    if (user) {
      user.credits = credits;
      await this.userRepository.save(user);
    }
  }
  async decrementCredits(userId: string, amount: number) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.credits < amount) {
      throw new BadRequestException('No tienes créditos suficientes');
    }

    user.credits -= amount;

    return this.userRepository.save(user);
  }
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(email);
  }

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    return await this.userRepository.create(data);
  }
}