import { Body, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/providers/user.service';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from '../dtos/createPostDto';
import { TagsService } from 'src/tags/providers/tags.service';
import { PatchPostDto } from '../dtos/patch-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    private readonly tagsService: TagsService,
    private readonly usersService: UsersService,
  ) {}
  public async findAll(userId: number) {
    // Users service
    // find a user
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

  public async update(patchPostDto: PatchPostDto) {
    // find the tags
    const tags = patchPostDto.tags
      ? await this.tagsService.findMultipleTags(patchPostDto.tags)
      : [];

    // find the post based on the id
    const post = await this.postsRepository.findOneBy({
      id: patchPostDto.id,
    });

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
    return await this.postsRepository.save(post);
  }
}
