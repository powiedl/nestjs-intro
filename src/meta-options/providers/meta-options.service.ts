import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MetaOption } from '../meta-option.entity';
import { Repository } from 'typeorm';
import { CreatePostMetaOptionsDto } from '../dtos/create-post-metaoptions-dto';

@Injectable()
export class MetaOptionsService {
  constructor(
    @InjectRepository(MetaOption)
    private readonly metaOptionsRepository: Repository<MetaOption>,
  ) {}

  public async create(
    createPostMetaOptionDto: CreatePostMetaOptionsDto,
  ): Promise<MetaOption | undefined> {
    // check if user exists
    // console.log(
    //   'meta-options,service,1 - metaValue',
    //   createPostMetaOptionDto.metaValue,
    // );
    // const existingPostMetaOption = await this.metaOptionsRepository.findOne({
    //   where: { metaValue: createPostMetaOptionDto.metaValue },
    // });
    // console.log('meta-options,service,2');
    // if (existingPostMetaOption) {
    //   console.log('MetaOption already exists');
    //   return;
    // }
    // console.log('meta-options,service,3');

    //const existingPostMetaOption = await this.metaOptionsRepository.findOne({
    //  where: { metaValue: createPostMetaOptionDto.metaValue },
    //});

    const newPostMetaOption = this.metaOptionsRepository.create(
      createPostMetaOptionDto,
    );
    console.log(
      'meta-options,service,createMetaOption,newPostMetaOption=',
      newPostMetaOption,
    );

    return await this.metaOptionsRepository.save(newPostMetaOption);
  }
}
