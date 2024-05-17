import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtHelper } from '@src/common/jwt/token-helper.function';
import { UsersService } from '@src/users/services/users.service';
import { CreateUserDto } from '@src/users/dto/create-user.dto';
import { ERROR_MESSAGES } from '@src/common/error-list';
import { AuthDto } from '../dto/auth.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponse } from '@src/users/helper/user-response';
import DatabaseService from '@src/database/service/database.service';

import * as dotenv from 'dotenv';
import * as argon2 from 'argon2';

dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private usersService: UsersService,
    private jwtHelper: JwtHelper,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    const databaseQuery = await this.databaseService.query(
      `SELECT * FROM users WHERE email=$1`,
      [createUserDto.email],
    );

    const existingUser = databaseQuery.rows[0];
    if (existingUser) {
      throw new BadRequestException(ERROR_MESSAGES.userExist);
    }

    const hash = await this.jwtHelper.hashData(createUserDto.password);
    const passwordMatches = await argon2.verify(
      hash,
      createUserDto.confirmPassword,
    );

    if (!passwordMatches) {
      throw new BadRequestException("Passwords don't match.");
    }

    const newUser = await this.usersService.createUser({
      ...createUserDto,
      password: hash,
    });

    const tokens = await this.jwtHelper.getTokens({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.name,
    });

    await this.databaseService.query(
      `INSERT INTO refresh_tokens (user_id, refresh_token, updated_at) VALUES ($1, $2, $3)`,
      [newUser.id, tokens.refreshToken, new Date()],
    );

    return { newUser, tokens };
  }

  async signAIn(data: AuthDto) {
    const databaseQuery = await this.databaseService.query(
      `SELECT * FROM users WHERE email=$1`,
      [data.email],
    );

    const user = plainToInstance(UserResponse, databaseQuery.rows[0]);
    if (!user) {
      throw new BadRequestException(ERROR_MESSAGES.userExist);
    }

    const passwordMatches = await argon2.verify(
      databaseQuery.rows[0].password,
      data.password,
    );

    if (!passwordMatches) {
      throw new BadRequestException("Passwords don't match.");
    }

    const tokens = await this.jwtHelper.getTokens({
      userId: user.id,
      email: user.email,
      username: user.name,
    });

    await this.jwtHelper.updateRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens };
  }

  async logout(userId: string) {
    await this.jwtHelper.updateRefreshToken(userId, null);
  }
}
