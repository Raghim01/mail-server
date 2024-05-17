import { Module } from '@nestjs/common';
import { EmailsService } from './services/emails.service';
import { EmailsController } from './controllers/emails.controller';
import { UsersModule } from '@src/users/users.module';
import DatabaseModule from '@src/database/database.module';
import { NotificationModule } from '@src/notification/notification.module';

@Module({
  imports: [UsersModule, DatabaseModule, NotificationModule],
  providers: [EmailsService],
  controllers: [EmailsController],
  exports: [EmailsService],
})
export class EmailsModule {}
