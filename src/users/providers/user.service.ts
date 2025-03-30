import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { GetUsersParamDto } from '../dtos/get-users-param.dto';
import { AuthService } from 'src/auth/providers/auth.service';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';

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
    // Auth service - to see if the requesting user is logged in
    if (this.authService.isAuth()) {
      return [
        { firstName: 'John', email: 'john@doe.com' },
        { firstName: 'Alice', email: 'alice@doe.com' },
      ];
    }
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
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      console.log('User already exists');
      return;
    }
    let newUser = this.usersRepository.create(createUserDto);
    newUser = await this.usersRepository.save(newUser);
    return newUser;
  }

  // Find a user by ID
  /**
   * finding a single user by the id of the user
   * @param id
   * @returns
   */
  public async findOneById(id: number) {
    return await this.usersRepository.findOneBy({ id });
  }
}
