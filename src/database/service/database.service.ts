import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { CONNECTION_POOL } from './database.module-definition';

@Injectable()
class DatabaseService {
  constructor(@Inject(CONNECTION_POOL) private readonly pool: Pool) {}

  async query(query: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      return await client.query(query, params);
    } finally {
      client.release();
    }
  }
}

export default DatabaseService;
