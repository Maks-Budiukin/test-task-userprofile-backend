import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Avatar } from '../user.model';

export class UserUpdateDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  number: string;

  @IsString()
  @IsOptional()
  linkedin: string;

  @IsString()
  @IsOptional()
  github: string;

  @ValidateNested()
  @IsOptional()
  avatar: Avatar;
}
