import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PostsService } from './providers/posts.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePostDto } from './dtos/createPostDto';
import { PatchPostDto } from './dtos/patch-post.dto';
import { GetPostsDto } from './dtos/get-posts.dto';

@Controller('posts')
@ApiTags('Posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('/:userId?')
  public getPosts(
    @Param('userId') userId: string,
    @Query() postQuery: GetPostsDto,
  ) {
    //console.log(postQuery);
    return this.postsService.findAll(postQuery, userId);
  }
  @Post()
  @ApiOperation({
    summary: 'Creates a new post',
  })
  @ApiResponse({
    status: 201,
    description: 'You get a 201 response, if your post is created successfully',
  })
  public createPost(@Body() createPostDto: CreatePostDto) {
    //console.log('posts.controller,create');
    return this.postsService.create(createPostDto);
  }

  @Patch()
  @ApiOperation({ summary: 'Update a particular post' })
  @ApiResponse({
    status: 200,
    description:
      'Yor get a 200 response, if the update oft the post was successful.',
  })
  public updatePost(@Body() patchPostDto: PatchPostDto) {
    return this.postsService.update(patchPostDto);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'delete a particular post' })
  @ApiResponse({
    status: 200,
    description: 'You get a 200 response, if the post was deleted successful.',
  })
  public async deleteRouteParam(@Param('id', ParseIntPipe) id: number) {
    console.log('posts controller, delete via route parameter, post id', id);
    return await this.postsService.delete(id);
  }
  @Delete('')
  @ApiOperation({ summary: 'delete a particular post' })
  @ApiResponse({
    status: 200,
    description: 'You get a 200 response, if the post was deleted successful.',
  })
  public async deleteQuery(@Query('id', ParseIntPipe) id: number) {
    console.log('posts controller, delete via query parameter, post id', id);
    return await this.postsService.delete(id);
  }
}
