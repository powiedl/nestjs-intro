<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## My .env.development content - with dummy values ...

```
# general
API_VERSION=0.1.2

# PostgreSQL
DB_PORT=5432
DB_HOST=localhost
DB_NAME=nestjs-blog
DB_USERNAME=postgres
DB_PASSWORD=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DB_SYNC=true
DB_AUTOLOAD=true

# for test purpose
S3_BUCKET=from_development
PROFILE_API_KEY="somevalue"

# JWT
JWT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
JWT_TOKEN_AUDIENCE=localhost:3000
JWT_TOKEN_ISSUER=localhost:3000
JWT_ACCESS_TOKEN_TTL=3600
JWT_REFRESH_TOKEN_TTL=172800 # two days (if I've calculated it correct in my head)

# Google Authentication
GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Uploadthing as alternative Storage Provider (as I don't have an AWS account and don't want to create one for this course)

I'll follow along the official Uploadthing Documentation for Express (as this is the package which is used by NestJS under the hood). I hope I will succeed in integrating Uploadthing to this NestJS app...

### Install the uploadthing package (for express)

```sh
npm install uploadthing
```

### UploadToUploadthingProvider

Instead of the AWS Provider create an UploadToUploadthingProvider (upload-to-uploadthing.provider.ts). We use the UTApi from uploadthing. We create an instance of this inside the controller of the UploadToUploadthingProvider (I guess it would be also possible to create `utapi` as a static member of the class, but I went with a normal member)

```ts
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { v4 as uuid4 } from 'uuid';
import { UTApi } from 'uploadthing/server';
import { FileEsque } from 'uploadthing/types';

@Injectable()
export class UploadToUploadthingProvider {
  private utapi: UTApi;

  constructor(private readonly configService: ConfigService) {
    const uploadThingToken = this.configService.get<string>('uploadthingToken');
    this.utapi = new UTApi({
      token: uploadThingToken,
    });
  }
  public async fileUpload(file: Express.Multer.File) {
    try {
      const fileEsque: FileEsque = new File([file.buffer], file.originalname, {
        type: file.mimetype,
        lastModified: new Date().getTime(),
      });
      fileEsque.customId = this.generateFileName(file);
      const { data } = await this.utapi.uploadFiles(fileEsque);
      console.log('UploadToUploadthingProvider,fileUpload,data', data);
      return data;
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
  }
  private generateFileName(file: Express.Multer.File) {
    // extract file name
    const name = file.originalname.split('.')[0];
    // remove white spaces
    name.replace(/\s/g, '').trim();
    // extract the extension
    const extension = path.extname(file.originalname);
    // generate time stamp
    const timestamp = new Date().getTime().toString().trim();

    // return file uuid
    return `${name}-${timestamp}-${uuid4()}${extension}`;
  }
}
```

### Use the UploadToUploadthingProvider in the uploads service

```ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Upload } from '../upload.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadToUploadthingProvider } from './upload-to-uploadthing-provider';
import { ConfigService } from '@nestjs/config';
import { UploadFile } from '../interfaces/upload-file.interface';
import { fileTypes } from '../enums/file-types.enum';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadsRepository: Repository<Upload>,
    private readonly uploadToUploadthingProvider: UploadToUploadthingProvider,
    private readonly configService: ConfigService,
  ) {}
  public async uploadFile(file: Express.Multer.File) {
    // throw error for unsupported mime types
    if (
      !['image/gif', 'image/jpeg', 'image/jpg', 'image/png'].includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException('Mime type not supported');
    }

    // Upload the file to Uploadthing
    try {
      const data = await this.uploadToUploadthingProvider.fileUpload(file);

      // Generate a new entry in database for the image
      const uploadFile: UploadFile = {
        name: data.name,
        path: data.ufsUrl,
        type: fileTypes.IMAGE,
        mime: file.mimetype,
        size: file.size,
      };

      const upload = this.uploadsRepository.create(uploadFile);
      return await this.uploadsRepository.save(upload);
    } catch (error) {
      throw new ConflictException(error);
    }
  }
}
```

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
