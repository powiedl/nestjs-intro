import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TagsModule } from './tags/tags.module';
import { MetaOptionsModule } from './meta-options/meta-options.module';
import { appConfig } from './config/app.config';

// User created modules
const ENV = process.env.NODE_ENV.trim();
console.log(`+${ENV}+`);

@Module({
  imports: [
    UsersModule,
    PostsModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        //entities: [User],
        autoLoadEntities: true,
        synchronize: true, // ACHTUNG: NUR in Development verwenden, es kann zu Datenverlust führen!
        port: configService.get<number>('database.port'),
        //username: configService.get('database.user'), // if I use this line it doesn't work
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        database: 'nestjs-blog',
      }),
    }),
    TagsModule,
    MetaOptionsModule,
    // /* synchrones verbinden mit der Datenbank */
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   entities: [],
    //   synchronize: true, // ACHTUNG: NUR in Development verwenden, es kann zu Datenverlust führen!
    //   port: 5432,
    //   username: process.env.DB_USERNAME,
    //   password: process.env.DB_PASSWORD,
    //   host: process.env.DB_HOST,
    //   database: 'nestjs-blog',
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
