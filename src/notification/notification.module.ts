import { Module } from '@nestjs/common';
import { UsersModule } from '@src/users/users.module';
import { NotificationGateway } from './gateway/notification.gateway';

@Module({
  imports: [UsersModule],
  controllers: [],
  providers: [NotificationGateway],
  exports: [NotificationGateway],
})
export class NotificationModule {}
