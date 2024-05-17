import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(
    `ALTER TABLE emails
    ADD COLUMN sender_deleted BOOLEAN DEFAULT FALSE,
    ADD COLUMN receiver_deleted BOOLEAN DEFAULT FALSE;`,
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(
    `ALTER TABLE emails 
    DROP COLUMN sender_deleted, 
    DROP COLUMN receiver_deleted;`,
  );
}
