import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email must have a valid format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Avatar must be a string' })
  avatar?: string;

  @IsOptional()
  @IsArray({ message: 'Roles must be an array' })
  roles?: string[];
}
