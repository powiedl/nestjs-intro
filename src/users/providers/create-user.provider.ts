import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { User } from '../user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { MailService } from 'src/mail/providers/mail.service';

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
    private readonly mailService: MailService,
  ) {}
  public async createUser(
    createUserDto: CreateUserDto,
  ): Promise<User | undefined> {
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
    } catch (error) {
      throw new InternalServerErrorException(
        'something went wrong while saving the user to the database',
        error,
      );
    }
    try {
      await this.mailService.sendUserWelcome(newUser);
    } catch (error) {
      console.log('ERROR Sending welcome mail', error);
    }
    return newUser;
  }
}
