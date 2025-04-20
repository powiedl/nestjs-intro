import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: '', // username of the database user (env.DB_USERNAME)
  password: '', // password of the database user (env.DB_PASSWORD)
  database: '', // database name (env.DB_NAME)
  entities: ['**/*.entity.js'],
  migrations: ['migrations/*.js'],
});
