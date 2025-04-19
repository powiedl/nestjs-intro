import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigService } from '@nestjs/config';
import { dropDatabase } from 'test/helpers/drop-database.helper';
import { bootstrapNestApplication } from 'test/helpers/bootstrap-nest-application.helper';
import { App } from 'supertest/types';
import {
  completeUser,
  missingEmail,
  missingFirstName,
  missingPassword,
} from './users.post.e2e-spec.sample-data';

describe('[Users] @Post Endpoints', () => {
  let app: INestApplication;
  let config: ConfigService;
  let httpServer: App;

  beforeEach(async () => {
    app = await bootstrapNestApplication();
    httpServer = app.getHttpServer();
    config = app.get<ConfigService>(ConfigService);
  });
  afterEach(async () => {
    await dropDatabase(config);
    await app.close();
  });

  // eigentliche tests
  it('/users - Endpoint is public', () => {
    return request(httpServer)
      .post('/users')
      .send({})
      .expect(400)
      .then((data) => {
        //        const { body } = data;
        //        console.log(body);
      });
  });

  it('/users - firstName is mandatory', () => {
    return request(httpServer)
      .post('/users')
      .send(missingFirstName)
      .expect(400);
  });
  it('/users - email is mandatory', () => {
    return request(httpServer).post('/users').send(missingEmail).expect(400);
  });
  it('/users - password is mandatory', () => {
    return request(httpServer).post('/users').send(missingPassword).expect(400);
  });
  it('/users - Valid request successfully creates a user', () => {
    return request(httpServer)
      .post('/users')
      .send(completeUser)
      .expect(201)
      .then(({ body }) => {
        // console.log('create user:', body);
        expect(body.data).toBeDefined();
        expect(body.data.firstName).toBe(completeUser.firstName);
        expect(body.data.lastName).toBe(completeUser.lastName);
        expect(body.data.email).toBe(completeUser.email);
        // here we do NOT test if the user is written to the database,
        // this test would have been placed inside the unit tests of the create method of the users module
      });
  });
  it('/users - password is not returned in response', () => {
    return request(httpServer)
      .post('/users')
      .send(completeUser)
      .expect(201)
      .then(({ body }) => {
        // console.log('create user:', body);
        expect(body.data.password).toBeUndefined();
      });
  });
  it('/users - googleId is not returned in response', () => {
    return request(httpServer)
      .post('/users')
      .send(completeUser)
      .expect(201)
      .then(({ body }) => {
        // console.log('create user:', body);
        expect(body.data.googleId).toBeUndefined();
      });
  });
});
