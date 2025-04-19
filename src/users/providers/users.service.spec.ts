import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './user.service';
import { CreateGoogleUserProvider } from './create-google-user.provider';
import { FindOneUserByGoogleIdProvider } from './find-one-user-by-google-id.provider';
import { FindOneUserByEmailProvider } from './find-one-user-by-email.provider';
import { CreateUserProvider } from './create-user.provider';
import { UsersCreateManyProvider } from './users-create-many.provider';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  beforeEach(async () => {
    const mockCreateUserProvider: Partial<CreateUserProvider> = {
      createUser: (createUserDto: CreateUserDto) =>
        Promise.resolve({
          id: 12,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          email: createUserDto.email,
          password: createUserDto.password,
        }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: CreateUserProvider, useValue: mockCreateUserProvider }, // damit mockt man den CreateUserProvider mit einem Objekt, dass genau die eine Funktion enthält, die das Service, dass man testen will aufruft
        { provide: DataSource, useValue: {} }, // damit mockt man eine DataSource mit einem leeren Objekt - Voraussetzung, dass man ein Repository mocken kann
        { provide: getRepositoryToken(User), useValue: {} }, // damit mockt man ein User-Repository mit einem leeren Objekt
        { provide: CreateGoogleUserProvider, useValue: {} }, // damit mockt man den CreateGoogleUserProvider mit einem leeren Objekt
        { provide: FindOneUserByGoogleIdProvider, useValue: {} }, // damit mockt man den CreateGoogleUserProvider mit einem leeren Objekt
        { provide: FindOneUserByEmailProvider, useValue: {} }, // damit mockt man den CreateGoogleUserProvider mit einem leeren Objekt
        { provide: UsersCreateManyProvider, useValue: {} }, // damit mockt man den CreateGoogleUserProvider mit einem leeren Objekt
      ],
      // here you need to add the things you need for your test
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should be defined', () => {
      expect(service.createUser).toBeDefined();
    });
    it('should trigger the CreateUserProvider.createUser', async () => {
      const user = await service.createUser({
        firstName: 'first',
        lastName: 'last',
        email: 'email@do.wo',
        password: 'password123!',
      });
      expect(user.firstName).toEqual('first');
      expect(user.lastName).toEqual('last');
    });
  });
});
