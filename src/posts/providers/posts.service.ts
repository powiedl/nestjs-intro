import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/providers/user.service';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    private readonly usersService: UsersService,
  ) {}
  public findAll(userId: string) {
    // Users service
    // find a user
    const user = this.usersService.findOneById(userId);

    return [
      {
        user,
        title: 'Test Title1',
        content: 'Test Content1',
      },
      {
        user,
        title: 'Test Title2',
        content: 'Test Content2',
      },
    ];
  }
}
