import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EmailsModule } from './emails/emails.module';
import DatabaseModule from './database/database.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    DatabaseModule,
    EmailsModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
