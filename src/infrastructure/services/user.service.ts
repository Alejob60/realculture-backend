import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole } from 'src/domain/enums/user-role.enum';

const PLAN_CREDITS = {
  'promo-image': {
    FREE: 10,
    CREATOR: 15,
    PRO: 10,
  },
  'promo-video': {
    FREE: 25,
    CREATOR: 25,
    PRO: 15,
  },
  audio: {
    FREE: 5,
    CREATOR: 5,
    PRO: 0,
  },
  subtitles: {
    FREE: 10,
    CREATOR: 10,
    PRO: 5,
  },
  'ai-agent': {
    FREE: null,
    CREATOR: 150,
    PRO: 150,
  },
  'campaign-automation': {
    FREE: null,
    CREATOR: 40,
    PRO: 20,
  },
  avatar: {
    FREE: null,
    CREATOR: null,
    PRO: 150,
  },
};

export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getCredits(userId: string) {
    const user = await this.userRepository.findOneBy({ userId: userId });
    return { credits: user?.credits ?? 0 };
  }

  async findById(userId: string): Promise<UserEntity | null> {
    return await this.userRepository.findOneBy({ userId: userId });
  }

  async upgradePlan(userId: string, newPlan: 'CREATOR' | 'PRO') {
    const user = await this.userRepository.findOneBy({ userId: userId });
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
  async save(user: UserEntity): Promise<void> {
    await this.userRepository.save(user);
  }
  async setCredits(userId: string, credits: number) {
    // Si usas TypeORM
    await this.userRepository.update({ userId: userId }, { credits });
  }
  async decrementCredits(userId: string, amount: number) {
    const user = await this.userRepository.findOne({
      where: { userId: userId },
    });

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
    return this.userRepository.findOne({ where: { email } });
  }

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.userRepository.create(data);
    return await this.userRepository.save(user);
  }
}
