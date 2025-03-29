import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { UsersService } from 'src/users/providers/user.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}
  public login(email: string, password: string, id: string) {
    // Check user exists in database
    const user = this.usersService.findOneById(id);
    // login
    // return token
    return 'SAMPLE_TOKEN';
  }

  public isAuth() {
    return true;
  }
}
