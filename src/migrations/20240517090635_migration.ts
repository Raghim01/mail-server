import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(
    `   CREATE TABLE user_connection_status(
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id),
            socket_id VARCHAR(255) NOT NULL,
            status VARCHAR(255) NOT NULL
        )`,
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`DROP TABLE user_connection_status`);
}
