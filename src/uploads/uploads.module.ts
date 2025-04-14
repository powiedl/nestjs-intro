import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './providers/uploads.service';
import { UploadToUploadthingProvider } from './providers/upload-to-uploadthing-provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Upload } from './upload.entity';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, UploadToUploadthingProvider],
  imports: [TypeOrmModule.forFeature([Upload])],
})
export class UploadsModule {}
