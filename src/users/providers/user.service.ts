import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { GetUsersParamDto } from '../dtos/get-users-param.dto';
import { AuthService } from 'src/auth/providers/auth.service';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import profileConfig from '../config/profile.config';
import { ConfigType } from '@nestjs/config';

/**
 * Class to connect to Users table and perform business operations
 */
@Injectable()
export class UsersService {
  /**
   * Constructor of the UsersService class - it adds the connection to the AuthService
   * @param authService the parmeter to thee authService
   */
  constructor(
    /**
     * Injecting usersRepository
     */
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    @Inject(profileConfig.KEY)
    private readonly profileConfiguration: ConfigType<typeof profileConfig>,
  ) {}
  /**
   * get all users - with respect to pagination
   * @param getUserParamDto retrieves all users from the database. It uses pagination
   * @param limit
   * @param page
   * @returns
   */
  public findAll(
    getUserParamDto: GetUsersParamDto,
    limit: number,
    page: number,
  ) {
    throw new HttpException(
      {
        status: HttpStatus.MOVED_PERMANENTLY,
        error: 'The API endpoint does not exist',
        fileName: 'users.service.ts',
        lineNumber: 88,
      },
      HttpStatus.MOVED_PERMANENTLY,
      {
        description: 'Occured because the API endpoint was permanently moved',
        cause: new Error(),
      },
    );
  }

  public async createUser(
    createUserDto: CreateUserDto,
  ): Promise<User | undefined> {
    if (!this.authService.isAuth()) {
      //throw new Error('you must be authenticated');
      console.log('you must be authenticated to use this function');
      return;
    }
    // check if user exists
    let existingUser = undefined;
    try {
      existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });
    } catch (error) {
      // Might save the details of the exception
      // Information which is sensitive
      console.log('error inside createUser', error);
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try later',
        { description: 'error during fetch existing user' },
      );
    }
    if (existingUser) {
      throw new BadRequestException(
        'The user already exists, please check your email.',
      );
    }
    let newUser = this.usersRepository.create(createUserDto);
    try {
      newUser = await this.usersRepository.save(newUser);
      return newUser;
    } catch (error) {
      throw new InternalServerErrorException(
        'something went wrong while saving the user to the database',
        error,
      );
    }
  }

  // Find a user by ID
  /**
   * finding a single user by the id of the user
   * @param id
   * @returns
   */
  public async findOneById(id: number) {
    let user = undefined;
    try {
      user = await this.usersRepository.findOneBy({ id });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to connect to the database, please try again later',
      );
    }
    if (!user) {
      throw new NotFoundException(`There is no user with the given id (${id})`);
    }
    return user;
  }
}
