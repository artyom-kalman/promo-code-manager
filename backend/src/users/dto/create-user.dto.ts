import { IsEmail, IsString, IsEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsEmpty()
  phone: string;

  @IsString()
  @MinLength(8)
  password: string;
}
