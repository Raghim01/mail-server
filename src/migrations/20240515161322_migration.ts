import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('emails', (table) => {
    table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).primary();
    table.text('message').notNullable();
    table.uuid('sender_id').notNullable().references('id').inTable('users');
    table.uuid('receiver_id').notNullable().references('id').inTable('users');
    table.timestamp('created_at').nullable();
    table.timestamp('updated_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE emails`);
}
