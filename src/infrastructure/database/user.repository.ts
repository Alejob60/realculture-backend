// src/infrastructure/database/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum'; // ✅ Asegúrate de tener este enum

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    return this.repo.save(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repo
      .createQueryBuilder('user')
      .addSelect('user.password') // ⚠️ necesario si password tiene select: false
      .where('user.email = :email', { email })
      .getOne();
  }

  async save(user: Partial<UserEntity>): Promise<UserEntity> {
    return this.repo.save(user);
  }

  async findAll(): Promise<UserEntity[]> {
    return this.repo.find();
  }

  // ✅ TIPADO CORRECTO PARA role
  async findAllByRole(role: UserRole): Promise<UserEntity[]> {
    return this.repo.find({ where: { role } });
  }

  async findById(userId: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { userId: userId } });
  }
}
