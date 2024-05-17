import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '@src/common/interfaces/current-user.interface';
import { UsersService } from '@src/users/services/users.service';
import { CreateEmailDto } from '../dto/create-email.dto';
import { ERROR_MESSAGES } from '@src/common/error-list';
import { EmailInterface } from '../interfaces/email.interface';
import { UpdateEmailDto } from '../dto/update-email.dto';
import { NotificationGateway } from '@src/notification/gateway/notification.gateway';
import DatabaseService from '@src/database/service/database.service';

@Injectable()
export class EmailsService {
  constructor(
    private usersService: UsersService,
    private databaseService: DatabaseService,
    private notificationGateway: NotificationGateway,
  ) {}

  async createEmail(user: AuthUser, createEmailDto: CreateEmailDto) {
    try {
      const sender = await this.usersService.getById(user.id);

      if (!sender) {
        throw new BadRequestException(ERROR_MESSAGES.userDontExist);
      }

      const receiver = await this.usersService.getByEmail(
        createEmailDto.receiverEmail,
      );

      if (!receiver) {
        throw new BadRequestException(ERROR_MESSAGES.userWithEmailDontExist);
      }

      const newEmail = await this.databaseService.query(
        `INSERT INTO emails (sender_id, receiver_id, message, created_at)
          VALUES ($1, $2, $3, $4) RETURNING *`,
        [sender.id, receiver.id, createEmailDto.message, new Date()],
      );

      await this.notificationGateway.notifyUser(
        'send_notification',
        receiver.id,
      );

      return newEmail.rows[0];
    } catch (err) {
      throw new HttpException(err.message, err.status);
    }
  }

  async getAllEmails(user: AuthUser): Promise<EmailInterface[]> {
    try {
      const databaseQuery = await this.databaseService.query(
        `SELECT * FROM emails WHERE sender_id = $1 OR receiver_id = $1`,
        [user.id],
      );

      return databaseQuery.rows;
    } catch (err) {
      throw new HttpException(err.message, err.status);
    }
  }

  async getAllSendedEmails(user: AuthUser): Promise<EmailInterface[]> {
    try {
      const databaseQuery = await this.databaseService.query(
        `SELECT * 
        FROM emails 
        WHERE sender_id = $1 AND sender_deleted = false`,
        [user.id],
      );

      return databaseQuery.rows;
    } catch (error) {}
  }

  async getAllReceivedEmails(user: AuthUser): Promise<EmailInterface[]> {
    try {
      const databaseQuery = await this.databaseService.query(
        `SELECT * 
        FROM emails 
        WHERE receiver_id = $1 AND receiver_deleted = false`,
        [user.id],
      );

      return databaseQuery.rows;
    } catch (error) {}
  }

  async getEmailById(user: AuthUser, emailId: string): Promise<EmailInterface> {
    try {
      const databaseQuery = await this.databaseService.query(
        `SELECT * FROM emails WHERE id = $1 AND (sender_id = $2 OR receiver_id = $2)`,
        [emailId, user.id],
      );

      return databaseQuery.rows[0];
    } catch (err) {
      throw new HttpException(err.message, err.status);
    }
  }

  async updateEmail(
    user: AuthUser,
    emailId: string,
    updateEmailDto: UpdateEmailDto,
  ): Promise<EmailInterface> {
    try {
      const existingEmail = await this.databaseService.query(
        `SELECT * FROM emails 
        WHERE id = $1 AND sender_id = $2`,
        [emailId, user.id],
      );

      console.log(existingEmail.rows[0]);
      if (!existingEmail.rows.length) {
        throw new NotFoundException(ERROR_MESSAGES.emailNotFound);
      }

      const updatedEmail = await this.databaseService.query(
        `UPDATE emails SET message = $1, updated_at = $2 WHERE ID = $3 RETURNING *`,
        [updateEmailDto.message, new Date(), existingEmail.rows[0].id],
      );

      return updatedEmail.rows[0];
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async deleteEmail(user: AuthUser, emailId: string) {
    try {
      const existingEmail = await this.databaseService.query(
        `SELECT * FROM emails 
        WHERE id = $1 AND (sender_id = $2 OR receiver_id = $2)`,
        [emailId, user.id],
      );

      if (!existingEmail.rows.length) {
        throw new NotFoundException(ERROR_MESSAGES.emailNotFound);
      }

      if (existingEmail.rows[0].sender_id === user.id) {
        await this.databaseService.query(
          `UPDATE emails
            SET sender_deleted = true
            WHERE id = $1`,
          [existingEmail.rows[0].id],
        );
      } else if (existingEmail.rows[0].receiver_id === user.id) {
        await this.databaseService.query(
          `UPDATE emails
              SET receiver_deleted = true
              WHERE id = $1`,
          [existingEmail.rows[0].id],
        );
      }

      return { deleted: true };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
