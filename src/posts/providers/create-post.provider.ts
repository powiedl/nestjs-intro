import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreatePostDto } from '../dtos/createPostDto';
import { UsersService } from 'src/users/providers/user.service';
import { TagsService } from 'src/tags/providers/tags.service';
import { Repository } from 'typeorm';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { Tag } from 'src/tags/tag.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class CreatePostProvider {
  constructor(
    private readonly usersService: UsersService,
    private readonly tagsService: TagsService,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}
  public async create(createPostDto: CreatePostDto, user: ActiveUserData) {
    // find author from database based on authorId
    let author: User | undefined = undefined;
    try {
      author = await this.usersService.findOneById(user.sub);
    } catch {
      throw new RequestTimeoutException(
        'Unable to communicate with the database. Please try again in a few minutes',
      );
    }
    if (!author) {
      throw new BadRequestException('No matching author found in the database');
    }

    // find the associated tags
    let tags: Tag[] | undefined = undefined;
    if (createPostDto.tags) {
      tags = await this.tagsService.findMultipleTags(createPostDto.tags);
      if (tags.length !== createPostDto.tags.length)
        throw new BadRequestException(
          'At least some of the provided tags are invalid!',
        );
    }

    // create post
    //    console.log('posts.service, create, 2');
    const post = this.postsRepository.create({
      ...createPostDto,
      author,
      tags,
    });

    try {
      return await this.postsRepository.save(post);
    } catch {
      throw new RequestTimeoutException(
        'Unable to communicate with the database. Please try again in a few minutes.',
      );
    }
  }
}
