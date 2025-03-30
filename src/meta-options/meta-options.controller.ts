import { Body, Controller, Post } from '@nestjs/common';
import { CreatePostMetaOptionsDto } from './dtos/create-post-metaoptions-dto';
import { MetaOptionsService } from './providers/meta-options.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('meta-options')
@ApiTags('MetaOptions')
export class MetaOptionsController {
  constructor(
    // Injecting Users Service
    private readonly metaOptionsService: MetaOptionsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Creates a new post',
  })
  @ApiResponse({
    status: 201,
    description:
      'You get a 201 response, if your metaOption is created successfully',
  })
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
