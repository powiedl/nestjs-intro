import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { GetUsersParamDto } from './dtos/get-users-param.dto';
import { PatchUserDto } from './dtos/patch-user.dto';
import { UsersService } from './providers/user.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateManyUsersDto } from './dtos/create-many-users.dto';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(
    // Injecting Users Service
    private readonly usersService: UsersService,
  ) {}
  /*
   * Final Endpoint - /users/:id??limit=10&page=1
   * Param id - optional, convert to integer, cannot have a default value
   * Query limit - integer, default 10
   * Query page - integes, default 1
   * ==> USE CASES
   * /user/ -> return all users with default pagination
   * /user/1233 -> return one user who has the id 1233
   * /users?limit=10&page=2 -> return page 2 with pagesize of limit (10) - so users 11 to 20
   */
  @Get('/:id?')
  @ApiOperation({
    summary: 'Fetches a list of registered users on the application',
  })
  @ApiResponse({
    status: 200,
    description: 'Users fetched successfully based on the query',
  })
  @ApiQuery({
    name: 'limit',
    description: 'how many results should be returned per query',
    example: 10,
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'the position of the page number you want the API to return',
    example: 1,
    type: 'number',
    required: false,
  })
  public getUsers(
    @Param() getUsersParamDto: GetUsersParamDto,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    /*  // Demonstration wie man die URL Teile bekommt, validiert und als Variablen speichert
    console.log('getUsersParamDto', getUsersParamDto);
    console.log('Query limit:', typeof limit, limit);
    console.log('Query page:', typeof page, page);
    const { id } = getUsersParamDto;
    if (id) {
      return `You sent a get request to users endpoint - for User ${id}`;
    } else {
      return `You sent a get request to users endpoint - for no specific user`;
    }
*/
    return this.usersService.findAll(getUsersParamDto, limit, page);
  }

  @Post()
  public createUsers(@Body() createUserDto: CreateUserDto) {
    const createdUserEntity = this.usersService.createUser(createUserDto);
    console.log(createdUserEntity);
    return createdUserEntity;
  }

  @Post('create-many')
  public createManyUsers(@Body() createUsersDto: CreateManyUsersDto) {
    let createdUsersEntity = undefined;
    createdUsersEntity = this.usersService.createMany(createUsersDto);
    return createdUsersEntity;
  }

  @Patch()
  public patchUser(@Body() patchUserDto: PatchUserDto) {
    console.log(patchUserDto);
    return patchUserDto;
  }
}
