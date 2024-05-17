import { HttpException, Injectable } from '@nestjs/common';
import { UserStatus } from '../enums/user.status';
import { JwtService } from '@nestjs/jwt';
import { ERROR_MESSAGES } from '@src/common/error-list';
import DatabaseService from '@src/database/service/database.service';

@Injectable()
export class UsersConnectionService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async connectUser(userId: string, socketId: string): Promise<void> {
    try {
      await this.databaseService.query(
        `INSERT INTO user_connection_status (
          user_id, socket_id, status
        ) VALUES ($1, $2, $3)`,
        [userId, socketId, UserStatus.online],
      );
    } catch (err) {
      throw new HttpException(err.message, err.status);
    }
  }

  async disconnectUser(userId: string, socketId: string): Promise<void> {
    await this.databaseService.query(
      `UPDATE user_connection_status 
        SET status = $3
        WHERE user_id = $1 AND socket_id = $2
        `,
      [userId, socketId, UserStatus.offline],
    );
  }

  async getUserSocket(userId: string) {
    const databaseQuery = await this.databaseService.query(
      `SELECT socket_id
        FROM user_connection_status
        WHERE user_id = $1 AND status = $2
        `,
      [userId, UserStatus.online],
    );

    return databaseQuery.rows[0];
  }

  async decodeJwtToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      if (payload) {
        return payload;
      }
    } catch (error) {
      throw new Error(ERROR_MESSAGES.invalidToken);
    }
  }
}
