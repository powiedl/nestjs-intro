import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/user.entity';
import { TagsModule } from './tags/tags.module';
import { MetaOptionsModule } from './meta-options/meta-options.module';

// User created modules

@Module({
  imports: [
    UsersModule,
    PostsModule,
    AuthModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [],
      inject: [],
      useFactory: () => ({
        type: 'postgres',
        //entities: [User],
        autoLoadEntities: true,
        synchronize: true, // ACHTUNG: NUR in Development verwenden, es kann zu Datenverlust führen!
        port: 5432,
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
