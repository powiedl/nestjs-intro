import {
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';

@Injectable()
export class FindOneUserByEmailProvider {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  public async findOneByEmail(email: string) {
    let user: User | undefined = undefined;
    try {
      user = await this.usersRepository.findOneBy({
        email,
      });
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not fetch the user',
      });
    }
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }
    return user;
  }
}
