import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserCreateDto } from './dto/user-create.dto';
import { GetUser } from 'src/decorators/getUser.decorator';
import { JwtAuthGuard } from '../guards/auth.guard';
import { UserResponseDto } from './dto/user-response.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { Request } from 'express';
import { User } from './user.model';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() dto: UserCreateDto) {
    const token = await this.userService.createUser(dto);
    this.userService.sendVerificationEmail(token, dto.email);
    return;
  }

  @Get('activate/:token')
  async activate(@Param('token') token: string) {
    return await this.userService.verifyEmail(token);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: UserCreateDto) {
    const user = await this.userService.validateUser(dto);
    return await this.userService.loginUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  @HttpCode(204)
  async logout(
    @GetUser() user: UserResponseDto,
    @Req() request: Request,
  ): Promise<void> {
    return await this.userService.logoutUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('current')
  async refresh(@GetUser() user: UserResponseDto): Promise<UserResponseDto> {
    return await this.userService.refreshfUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:id')
  @UseInterceptors(FileInterceptor('files'))
  async updateUser(
    @Body() dto: UserUpdateDto,
    @GetUser() user: UserResponseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.userService.updateUser(dto, user, file);
  }
}
