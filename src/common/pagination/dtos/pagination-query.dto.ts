import { DefaultValuePipe } from '@nestjs/common';
import { IsOptional, IsPositive, Max } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  // @Type(() => Number) - kann weggelassen werden, wenn man enableImplicitConversion: true in der Definition der useGlobalPipes hat
  @Max(1000, {
    message: 'the maximum number of items to fetch at once is 1000',
  })
  limit?: number = 10;

  @IsOptional()
  @IsPositive()
  //@Type(() => Number)
  page?: number = 1;
}
