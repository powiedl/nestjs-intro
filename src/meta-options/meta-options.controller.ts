import { Body, Controller, Post } from '@nestjs/common';
import { CreatePostMetaOptionsDto } from './dtos/create-post-metaoptions-dto';
import { MetaOptionsService } from './providers/meta-options.service';

@Controller('meta-options')
export class MetaOptionsController {
  constructor(
    // Injecting Users Service
    private readonly metaOptionsService: MetaOptionsService,
  ) {}
  @Post()
  public async create(
    @Body() createPostMetaOptionsDto: CreatePostMetaOptionsDto,
  ) {
    const createdPostMetaOptionEntity = await this.metaOptionsService.create(
      createPostMetaOptionsDto,
    );
    console.log('meta-options,controller:', createdPostMetaOptionEntity);
    return createdPostMetaOptionEntity;
  }
}
