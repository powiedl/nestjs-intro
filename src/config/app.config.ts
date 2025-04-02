export const appConfig = () => {
  console.log('appConfig', process.env);
  return {
    environment: process.env.NODE_ENV?.trim() || 'production',
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      name: process.env.DB_NAME || 'nestjs-blog',
      synchronize: process.env.DB_SYNC === 'true' ? true : false,
      autoLoadEntities: process.env.DB_AUTOLOAD === 'true' ? true : false,
    },
  };
};
