import { Module } from '@nestjs/common';
import { UsersController } from './controller/users.controller';
import DatabaseModule from '@src/database/database.module';
import { UsersService } from './services/users.service';
import { UsersConnectionService } from './services/users.connection.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [UsersController],
  providers: [UsersService, UsersConnectionService],
  exports: [UsersService, UsersConnectionService],
})
export class UsersModule {}
