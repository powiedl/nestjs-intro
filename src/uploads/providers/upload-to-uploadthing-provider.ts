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
