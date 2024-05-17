import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponse } from '../helper/user-response';
import DatabaseService from '@src/database/service/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createUser(createUserDto: CreateUserDto) {
    const createdUser = await this.databaseService.query(
      `INSERT INTO users (
      username, email, password, created_at
    ) VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        createUserDto.name,
        createUserDto.email,
        createUserDto.password,
        new Date(),
      ],
    );

    return plainToInstance(UserResponse, createdUser.rows[0]);
  }

  async getAll(): Promise<any> {
    const result = await this.databaseService.query('SELECT * FROM users');
    return result.rows;
  }

  async getById(id: string): Promise<any> {
    const result = await this.databaseService.query(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );

    return result.rows[0];
  }

  async getByEmail(email: string): Promise<any> {
    const result = await this.databaseService.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );

    return result.rows[0];
  }
}
