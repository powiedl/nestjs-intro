import {
  Body,
  Controller,
  Delete,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTagDto } from './dtos/create-tag-dto';
import { TagsService } from './providers/tags.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('tags')
@ApiTags('Tags')
export class TagsController {
  constructor(
    /**
     * Inject the TagsService
     */
    private readonly tagsService: TagsService,
  ) {}

  /**
   * Calls the create method of the service (in Response to a POST request to this controller)
   * @param createTagDto
   * @returns
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new Tag',
  })
  @ApiResponse({
    status: 201,
    description:
      'You get a 201 response if the creation of the tag was successful.',
  })
  public create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete a Tag by id (received as query parameter',
  })
  @ApiResponse({
    status: 200,
    description:
      'You get a 200 response if the deletion of the tag was successful.',
  })
  @ApiQuery({
    name: 'id',
    description: 'the id of the tag, which you want to delete',
    example: 1,
    type: 'number',
    required: true,
  })
  public async delete(
    @Query('id', ParseIntPipe)
    id: number,
  ) {
    //console.log('powidl controller: delete tag', id);
    return this.tagsService.delete(id);
  }

  @Delete('soft-delete')
  public async softDelete(
    @Query('id', ParseIntPipe)
    id: number,
  ) {
    return this.tagsService.softDelete(id);
  }
}
