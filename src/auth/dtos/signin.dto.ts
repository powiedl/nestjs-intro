import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message:
      'a minimum length of 8 characters, at least one letter, on number and on of the following special charaters (@$!%*#?&)',
  }) // RegEx für mindestens einen Buchstaben, eine Ziffer und ein Soderzeichen (@$!%*#?&)
  password: string;
}
