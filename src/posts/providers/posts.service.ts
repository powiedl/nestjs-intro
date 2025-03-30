import { Body, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/providers/user.service';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from '../dtos/createPostDto';
import { MetaOption } from 'src/meta-options/meta-option.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(MetaOption)
    private metaOptionsRepository: Repository<MetaOption>,
    private readonly usersService: UsersService,
  ) {}
  public async findAll(userId: string) {
    // Users service
    // find a user
    const user = this.usersService.findOneById(userId);

    let posts = await this.postsRepository.find({
      select: {
        metaOptions: {
          id: true,
          metaValue: true,
        },
      },
      relations: {
        metaOptions: true,
      },
    });
    return posts;
  }
  /**
   * Creating new posts
   */
  public async create(@Body() createPostDto: CreatePostDto) {
    //console.log('posts.service, create, 1');
    /* umständlich - statt dessen verwenden wir cascade (damit "verschwindet" die Dependency to meta Options bzw. wird sie über die Datenbank selbst realisiert)
    // create metaOptions
    let metaOptions = createPostDto.metaOptions
      ? this.metaOptionsRepository.create(createPostDto.metaOptions)
      : null;
    if (metaOptions) {
      await this.metaOptionsRepository.save(metaOptions);
    }
*/
    // create post
    //    console.log('posts.service, create, 2');
    let post = this.postsRepository.create(createPostDto);

    /* umständlich - statt dessen verwenden wir cascade (damit "verschwindet" die Dependency to meta Options bzw. wird sie über die Datenbank selbst realisiert)
    // add metaOptions to the post
    if (metaOptions) {
      post.metaOptions = metaOptions;
    }
*/
    // return post to the user
    //console.log('posts.service, create, 3');

    return await this.postsRepository.save(post);
  }

  public async delete(id: number) {
    console.log(`trying to delete post with id of ${id}`);
    /* ohne onDelete:'CASCADE' im meta-options.entity.ts File
    // find the post
    let post = await this.postsRepository.findOneBy({ id });
    console.log('post:', post);
    if (!post) {
      console.log(`there is no post with the id of ${id}`);
      return { deleted: false, id };
    }
    // delete the post
    await this.postsRepository.delete(id);

    // delete the meta options
    //await this.metaOptionsRepository.delete(post.metaOptions.id);
*/

    // deleting the post
    await this.postsRepository.delete(id);
    // confirmation message
    return { deleted: true, id };
  }
}
