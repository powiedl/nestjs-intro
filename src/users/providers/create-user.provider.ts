import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { AuthService } from 'src/auth/providers/auth.service';
import { User } from '../user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

@Injectable()
export class CreateUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    /**
     * Inject HashingProvider
     */
    @Inject(forwardRef(() => HashingProvider))
    private hashingProvider: HashingProvider,
    private readonly authService: AuthService,
  ) {}
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
    let newUser = this.usersRepository.create({
      ...createUserDto,
      password: await this.hashingProvider.hashPassword(createUserDto.password),
    });
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
}
