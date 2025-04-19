// my code
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  public async sendUserWelcome(user: User): Promise<void> {
    //console.log('MailService,MailerService', this.mailerService);
    await this.mailerService.sendMail({
      to: user.email,
      from: `Onboarding Team <support@nestjs-blog.com>`,
      subject: 'Welcome to the famous NestJS Blog',
      template: './welcome',
      context: {
        name: user.firstName,
        email: user.email,
        loginUrl: 'http://localhost:3000',
      },
    });
  }
}

/*
// Maniks code
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/users/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserWelcome(user: User): Promise<void> {
    const result = await this.mailerService.sendMail({
      to: user.email,
      // override default from
      from: '"Onbaording Team" <support@nestjs-blog.com>',
      subject: 'Welcome to NestJs Blog',
      // `.ejs` extension is appended automatically to template
      template: './welcome',
      // Context is available in email template
      context: {
        name: user.firstName,
        email: user.email,
        loginUrl: 'http://localhost:3000',
      },
    });
    console.log('sendUserWelcome,result=', result);
  }
}
*/
