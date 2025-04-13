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
//import { appConfig } from './config/app.config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { PaginationModule } from './common/pagination/pagination.module';
import jwtConfig from './auth/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthenticationGuard } from './auth/guards/authentication/authentication.guard';
import { AccessTokenGuard } from './auth/guards/access-token/access-token.guard';
import { DataResponseInterceptor } from './common/interceptors/data-response/data-response.interceptor';
import environmentValidation from './config/environment.validation';

// User created modules
const ENV = process.env.NODE_ENV.trim();
console.log(`+${ENV}+`);
//console.log(process.env);

@Module({
  imports: [
    UsersModule,
    PostsModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig],
      validationSchema: environmentValidation,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        //console.log('configService:', configService);
        return {
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
        };
        console.log(
          '***************************************************************',
        );
      },
    }),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    TagsModule,
    MetaOptionsModule,
    PaginationModule,
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
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DataResponseInterceptor,
    },
    AccessTokenGuard, // notwendig, weil der AuthenticationGuard eine Dependency zum AccessTokenGuard hat
  ],
})
export class AppModule {}
