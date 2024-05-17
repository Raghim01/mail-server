import { Module } from '@nestjs/common';
import DatabaseService from './service/database.service';
import { Pool } from 'pg';

import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [],
  exports: [DatabaseService],
  providers: [
    DatabaseService,
    {
      provide: 'DATABASE_OPTIONS',
      useValue: {
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: +process.env.POSTGRES_PORT,
      },
    },
    {
      provide: 'CONNECTION_POOL',
      inject: ['DATABASE_OPTIONS'],
      useFactory: (databaseOptions: any) => {
        return new Pool({
          user: databaseOptions.user,
          host: databaseOptions.host,
          database: databaseOptions.database,
          password: databaseOptions.password,
          port: +databaseOptions.port,
        });
      },
    },
  ],
})
export default class DatabaseModule {}
