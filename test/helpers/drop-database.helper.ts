import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

export async function dropDatabase(config: ConfigService): Promise<void> {
  //console.log('TEST,dropDatabase,config', config);
  // Create the connection datasource
  const AppDataSource = await new DataSource({
    type: 'postgres',
    //entities: [User],
    //autoLoadEntities: true,
    synchronize: true, // ACHTUNG: NUR in Development verwenden, es kann zu Datenverlust führen!
    port: config.get<number>('database.port'),
    //username: config.get('database.user'), // if I use this line it doesn't work
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: 'nestjs-blog',
  }).initialize();

  // Drop all tables
  await AppDataSource.dropDatabase();

  // Close the connection
  await AppDataSource.destroy();
}
