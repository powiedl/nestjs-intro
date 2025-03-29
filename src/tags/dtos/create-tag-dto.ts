import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTagDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(256)
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(256)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'slug must only contain lowercase letter, digits and -. The - must neither be at the beginning nor at the end of the slug',
  })
  @ApiProperty({
    description: 'The slug for this tag - used in the URL for the tag.',
    example: 'javascript-tag',
    minLength: 2,
    maxLength: 256,
  })
  slug: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsJSON()
  @ApiPropertyOptional()
  schema?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(1024)
  @MinLength(3)
  featuredImageUrl?: string;
}
