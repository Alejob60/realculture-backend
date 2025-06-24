import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CreateCreatorDto } from '../../interfaces/dto/create-creator.dto';
import { UserRepository } from '../../infrastructure/database/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';

@Injectable()
export class CreatorService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(dto: CreateCreatorDto): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.userRepository.save({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.CREATOR,
    });

    return newUser;
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.findAllByRole(UserRole.CREATOR);
  }
}
