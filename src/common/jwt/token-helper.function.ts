import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenParameters } from './token-parameters.interface';
import { UsersService } from '@src/users/services/users.service';
import { ERROR_MESSAGES } from '../error-list';

import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
import DatabaseService from '@src/database/service/database.service';

dotenv.config();

@Injectable()
export class JwtHelper {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    private databaseService: DatabaseService,
  ) {}

  async getTokens(body: TokenParameters) {
    const { userId, username, email } = body;
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, name: username },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          name: username,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const databaseResponse = await this.databaseService.query(
      `UPDATE refresh_tokens SET refresh_token = $1, updated_at = $2 WHERE user_id = $3 RETURNING refresh_token`,
      [refreshToken, new Date(), userId],
    );

    const data = databaseResponse.rows[0];

    return data;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.databaseService.query(
      `SELECT users.*, refresh_tokens.*
      FROM users
      LEFT JOIN refresh_tokens ON users.id = refresh_tokens.user_id
      WHERE users.id = $1`,
      [userId],
    );

    if (!user || !user.rows[0].refresh_token) {
      throw new ForbiddenException(ERROR_MESSAGES.accessDenied);
    }

    const refreshTokenMatches = await argon2.verify(
      user.rows[0].refresh_token,
      refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new ForbiddenException(ERROR_MESSAGES.accessDeniedLogin);
    }

    const tokens = await this.getTokens({
      userId: user.rows[0].id,
      email: user.rows[0].email,
      username: user.rows[0].username,
    });

    await this.updateRefreshToken(user.rows[0].id, tokens.refreshToken);

    return tokens;
  }
}
