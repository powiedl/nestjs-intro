import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './createPostDto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class PatchPostDto extends PartialType(CreatePostDto) {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the post that needs to be updated',
  })
  id: number;
}
