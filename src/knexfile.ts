module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'root',
      database: 'postgres',
    },
    migrations: {
      directory: './migrations',
    },
  },
};
