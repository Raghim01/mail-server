import { table } from 'console';
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).primary();
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.string('refresh_token', 255).notNullable();
    table.timestamp('updated_at').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE refresh_tokens`);
}
