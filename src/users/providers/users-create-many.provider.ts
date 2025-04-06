import {
  ConflictException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { User } from '../user.entity';
import { DataSource } from 'typeorm';
import { CreateManyUsersDto } from '../dtos/create-many-users.dto';

@Injectable()
export class UsersCreateManyProvider {
  constructor(private readonly dataSource: DataSource) {}

  public async createMany(createUsersDto: CreateManyUsersDto) {
    let newUsers: User[] = [];
    // create query runner instance
    let queryRunner = this.dataSource.createQueryRunner();

    try {
      // connect query runner to datasource
      await queryRunner.connect();

      // start transaction
      await queryRunner.startTransaction();
    } catch (error) {
      throw new RequestTimeoutException(
        'unable to communicate with the database, please try again later',
      );
    }

    try {
      // db operations in the transaction ...
      for (let user of createUsersDto.users) {
        let newUser = queryRunner.manager.create(User, user); // create an object of type User and fill it with the data of user
        let result = await queryRunner.manager.save(newUser); // save the user to the database
        newUsers.push(result); // store the new user to the "result" of the transaction
      }

      // if successful - commit
      await queryRunner.commitTransaction();
    } catch (error) {
      // if unsuccessful - rollback
      newUsers = [];
      await queryRunner.rollbackTransaction();
      throw new ConflictException('could not complete the transaction', {
        description: String(error),
      });
    } finally {
      // release connection
      try {
        await queryRunner.release();
      } catch (error) {
        throw new RequestTimeoutException(
          'Could not release the database connection',
          { description: String(error) },
        );
      }
    }
    return newUsers;
  }
}
