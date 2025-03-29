import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PostsService } from './providers/posts.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePostDto } from './dtos/createPostDto';
import { PatchPostDto } from './dtos/patch-post.dto';

@Controller('posts')
@ApiTags('Posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  @Get('/:userId?')
  public getPosts(@Param('userId') userId: string) {
    return this.postsService.findAll(userId);
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
    console.log(createPostDto);
    return 'you created a post';
  }

  @Patch()
  @ApiOperation({ summary: 'Update a particular post' })
  @ApiResponse({
    status: 200,
    description:
      'Yor get a 200 response, if the update oft the post was successful.',
  })
  public updatePost(@Body() patchPostsDto: PatchPostDto) {
    console.log(patchPostsDto);
  }
}
