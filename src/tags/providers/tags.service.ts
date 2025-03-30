import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '../tag.entity';
import { In, Repository } from 'typeorm';
import { CreateTagDto } from '../dtos/create-tag-dto';

@Injectable()
export class TagsService {
  constructor(
    /**
     * Inject tagsRepository
     */
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  /**
   * Create a new tag entity
   * @param createTagDto
   * @returns the created tag entity
   */
  public async create(createTagDto: CreateTagDto) {
    const tag = this.tagsRepository.create(createTagDto);
    return await this.tagsRepository.save(tag);
  }

  public async findMultipleTags(ids: number[]) {
    return await this.tagsRepository.find({
      where: {
        id: In(ids),
      },
    });
  }

  public async delete(id: number) {
    //console.log('service: delete tag', id);

    await this.tagsRepository.delete(id);
    return { deleted: true, id };
  }

  public async softDelete(id: number) {
    //console.log('service: delete tag', id);

    await this.tagsRepository.softDelete(id);
    return { deleted: true, id };
  }
}
