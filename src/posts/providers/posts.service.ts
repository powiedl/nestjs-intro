import {
  Body,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { UsersService } from 'src/users/providers/user.service';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from '../dtos/createPostDto';
import { TagsService } from 'src/tags/providers/tags.service';
import { PatchPostDto } from '../dtos/patch-post.dto';
import { GetPostsDto } from '../dtos/get-posts.dto';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { CreatePostProvider } from './create-post.provider';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    private readonly tagsService: TagsService,
    private readonly usersService: UsersService,
    private readonly paginationProvider: PaginationProvider,
    private readonly createPostProvider: CreatePostProvider,
  ) {}
  public async findAll(
    postQuery: GetPostsDto,
    userId: string,
  ): Promise<Paginated<Post>> {
    let posts = await this.paginationProvider.paginateQuery(
      {
        limit: postQuery.limit,
        page: postQuery.page,
      },
      this.postsRepository,
    );
    return posts;
    // Users service
    // find a user
    /*
    const author = await this.usersService.findOneById(userId);
    console.log('searching posts of author', author);

    const posts = await this.postsRepository.find({
      where: { author },
      select: {
        metaOptions: {
          id: true,
          metaValue: true,
        },
      },
      relations: {
        metaOptions: true,
        author: true,
        tags: true,
      },
      take: postQuery.limit,
      skip: (postQuery.page - 1) * postQuery.limit,
    });
    return posts;
*/
  }
  /**
   * Creating new posts
   */
  public async create(
    @Body() createPostDto: CreatePostDto,
    user: ActiveUserData,
  ) {
    // ausgelagerter Provider
    return await this.createPostProvider.create(createPostDto, user);
    // alte Implementierung
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
    /*
    // find author from database based on authorId
    const author = await this.usersService.findOneById(createPostDto.authorId);

    // find the associated tags
    const tags = await this.tagsService.findMultipleTags(createPostDto.tags);

    // create post
    //    console.log('posts.service, create, 2');
    const post = this.postsRepository.create({
      ...createPostDto,
      author,
      tags,
    });

    /* umständlich - statt dessen verwenden wir cascade (damit "verschwindet" die Dependency to meta Options bzw. wird sie über die Datenbank selbst realisiert)
    // add metaOptions to the post
    if (metaOptions) {
      post.metaOptions = metaOptions;
    }
*/
    // return post to the user
    //console.log('posts.service, create, 3');

    //    return await this.postsRepository.save(post);
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

  public async update(patchPostDto: PatchPostDto) {
    // find the tags
    let tags = undefined;
    try {
      tags = patchPostDto.tags
        ? await this.tagsService.findMultipleTags(patchPostDto.tags)
        : [];
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try later',
        { description: 'error during fetch existing user' },
      );
    }
    if (patchPostDto.tags && patchPostDto.tags.length !== tags?.length) {
      throw new NotFoundException(
        'Unable to find the tags needed for this post',
        { description: 'tags not found' },
      );
    }

    // find the post based on the id
    let post = undefined;
    try {
      post = await this.postsRepository.findOneBy({
        id: patchPostDto.id,
      });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try later',
        { description: 'error during fetch existing user' },
      );
    }
    if (!post) {
      throw new NotFoundException('Unable to find the post to update', {
        description: 'post not found',
      });
    }

    // update the properties of the post
    // post = { ...post, ... patchPostDto} // funktioniert nicht, weil wenn man die id mitschickt, glaubt TypeORM dass es ein neues Entity anlegen muss, was mit einem duplicate error quittiert wird
    post.title = patchPostDto.title ?? post.title; // if patchPostDto.title exists, posts.title is set to it, otherwise it is set to itself (so remains unchanged)
    post.content = patchPostDto.content ?? post.content;
    post.status = patchPostDto.status ?? post.status;
    post.postType = patchPostDto.postType ?? post.postType;
    post.slug = patchPostDto.slug ?? post.slug;
    post.featuredImageUrl =
      patchPostDto.featuredImageUrl ?? post.featuredImageUrl;
    post.publishedOn = patchPostDto.publishedOn ?? post.publishedOn;
    //post.metaOptions = patchPostDto.metaOptions ?? post.metaOptions; // does not work, maybe we add this later ...

    // assign the new tags
    post.tags = tags;

    // save the post and return it
    try {
      return await this.postsRepository.save(post);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try later',
        { description: 'error during fetch existing user' },
      );
    }
  }
}
