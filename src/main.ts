import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { appCreate } from './app.create';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // add all middleware
  appCreate(app);

  // Add a global interceptor - this way it has no access to anything which gets added in the app.module (e.g. ConfigService)
  //app.useGlobalInterceptors(new DataResponseInterceptor());

  // you can access the ConfigService here - via the app object
  const configService = app.get(ConfigService);
  //console.log('main,configService', configService);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
