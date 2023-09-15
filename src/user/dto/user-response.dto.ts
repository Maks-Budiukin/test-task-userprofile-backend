import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Avatar } from '../user.model';

export class UserResponseDto {
  @IsString()
  _id?: string;

  @IsString()
  email: string;

  @IsString()
  name: string;

  @IsString()
  number: string;

  @IsString()
  linkedin: string;

  @IsString()
  github: string;

  @ValidateNested()
  avatar: Avatar;
}
