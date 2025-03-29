import {
  IsArray,
  //  IsDate,
  IsEnum,
  IsISO8601,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PostType } from '../enum/postType.enum';
import { PostStatus } from '../enum/postStatus.enum';
import { CreatePostMetaOptionsDto } from '../../meta-options/dtos/create-post-metaoptions-dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
const tagMinLength = 3;

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(512)
  @ApiProperty({
    description: 'The title of the post',
    example: 'my post title',
    minLength: 4,
    maxLength: 512,
  })
  title: string;

  @IsEnum(PostType)
  @IsNotEmpty()
  @ApiProperty({
    description: 'This is the type of the post to create',
    enum: PostType,
  })
  postType: PostType;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(256)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'slug must only contain lowercase letter, digits and -. The - must neither be at the beginning nor at the end of the slug',
  })
  @ApiProperty({
    description: 'The slug for this post - used in the URL for the post.',
    example: 'my-post',
    minLength: 2,
    maxLength: 256,
  })
  slug: string;

  @IsEnum(PostStatus)
  @IsNotEmpty()
  @ApiProperty({ enum: PostStatus, description: 'The status the post has.' })
  status: PostStatus;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The content of the post',
    example: 'This is my post',
  })
  content?: string;

  @IsString()
  @IsJSON()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'The schema of the post (it must be a valid json, otherwise a validation error will be thrown)',
    example:
      '{\r\n "@context":"https:\/\/schema.org",\r\n"@type":"Person"\r\n }',
  })
  schema?: string;

  @IsUrl()
  @IsOptional()
  @MaxLength(1024)
  @ApiPropertyOptional({
    description: 'Featured image for the blog post',
    example: 'http://localhost:3000/images/image1.jpg',
    maxLength: 1024,
  })
  featuredImageUrl?: string;

  @IsOptional()
  @IsISO8601() // @IsDate()
  @ApiPropertyOptional({
    description: 'The date of the publication of the post in an ISO8601 format',
    example: '2025-03-16T07:04:03+0000',
  })
  publishedOn?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MinLength(tagMinLength, { each: true })
  // @ApiPropertyOptional({
  //   description:
  //     'Array of tags passed as string values (each tag must have at least 3 characters)',
  //   example: ['nestjs', 'typescript'],
  // })
  @ApiPropertyOptional({
    type: 'array',
    //description: 'an array of tags you want to add to your post',
    items: {
      type: 'string',
      description: 'The tags you want to add to your post',
      minLength: tagMinLength,
      example: 'nestjs',
      examples: ['nestjs', 'typescript'],
      //examples: ['nestjs', 'typescript'],

      // this does not work - es zeigt tags dann als OrderedMap an
      // examples: {
      //   nestjs: { value: 'nestjs' },
      //   typescript: { value: 'typescript' },
      // },
    },
    //example: ['nestjs', 'typescript'],
  })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePostMetaOptionsDto)
  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description:
            'The key can be any string identifier for your meta option',
          example: 'sidebarEnabled',
        },
        value: {
          type: 'any',
          description: 'The value of the meta option key',
          example: true,
        },
      },
    },
    required: false,
  })
  metaOptions?: CreatePostMetaOptionsDto[];
}
