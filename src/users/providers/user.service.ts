import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { GetUsersParamDto } from '../dtos/get-users-param.dto';
import { AuthService } from 'src/auth/providers/auth.service';
import { DataSource, Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import profileConfig from '../config/profile.config';
import { ConfigType } from '@nestjs/config';
import { UsersCreateManyProvider } from './users-create-many.provider';
import { CreateManyUsersDto } from '../dtos/create-many-users.dto';
import { CreateUserProvider } from './create-user.provider';
import { FindOneUserByEmailProvider } from './find-one-user-by-email.provider';

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

    /** Inject createManyProvider */
    private readonly usersCreateManyProvider: UsersCreateManyProvider,

    private readonly createUserProvider: CreateUserProvider,

    private readonly findOneUserByEmailProvider: FindOneUserByEmailProvider,

    @Inject(profileConfig.KEY)
    private readonly profileConfiguration: ConfigType<typeof profileConfig>,

    /**
     * inject datasource
     */
    @Inject()
    private readonly dataSource: DataSource,
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
  public async createUser(createUserDto: CreateUserDto) {
    this.createUserProvider.createUser(createUserDto);
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

  public async findOneByEmail(email: string) {
    return await this.findOneUserByEmailProvider.findOneByEmail(email);
  }
  public async createMany(createUsersDto: CreateManyUsersDto) {
    return await this.usersCreateManyProvider.createMany(createUsersDto);
  }
}
