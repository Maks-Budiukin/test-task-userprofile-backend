import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.model';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserCreateDto } from './dto/user-create.dto';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { UserResponseDto } from './dto/user-response.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly filesService: FilesService,
  ) {}

  async findUser(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    return user;
  }

  async createUser(dto: UserCreateDto): Promise<string> {
    const user = await this.findUser(dto.email);

    if (user) {
      throw new ConflictException('User with this email already exists!');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const newUser = await this.userModel.create({
      ...dto,
      password: passwordHash,
    });

    const token = await this.jwtService.signAsync(newUser._id.toString());

    await this.userModel.findByIdAndUpdate(newUser._id, { token });

    return token;
  }

  public sendVerificationEmail(token: string, email: string): void {
    this.mailerService
      .sendMail({
        to: `${email}`,
        from: 'noreply',
        subject: 'Testing Nodemailer',
        text: `To activate your account, please, follow this link: http://localhost:4000/api/user/activate/${token}`,
      })
      .then((success) => {})
      .catch((err) => {
        console.log(err);
      });
  }

  async verifyEmail(token: string): Promise<Object> {
    const userID = await this.jwtService.verify(token);

    const user = await this.userModel.findById(userID);

    if (!user || user.token !== token) {
      throw new UnauthorizedException('Invalid link, try to register again!');
    }

    await this.userModel.findByIdAndUpdate(userID, { status: 'active' });

    return {
      message: 'Email verified!',
    };
  }

  async validateUser(dto: UserCreateDto): Promise<UserResponseDto> {
    const user = await this.findUser(dto.email);

    if (!user) {
      throw new UnauthorizedException('Email or password is wrong!');
    }

    const validPassword = await bcrypt.compare(dto.password, user.password);
    if (!validPassword) {
      throw new UnauthorizedException('Email or password is wrong!');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Please, verify your email!');
    }

    return user;
  }

  async loginUser(user: UserResponseDto): Promise<User> {
    const token = await this.jwtService.signAsync(user._id.toString());
    const loggedUser = await this.userModel
      .findByIdAndUpdate(user._id, { token }, { new: true })
      .select('-password -updatedAt -createdAt');

    return loggedUser;
  }

  async logoutUser(user: UserResponseDto): Promise<void> {
    const loggedOutUser = await this.userModel.findByIdAndUpdate(user._id, {
      token: null,
    });
    if (!loggedOutUser) {
      throw new NotFoundException('User not found!');
    }
    return;
  }

  async refreshfUser(user: UserResponseDto): Promise<User> {
    const foundUser = await this.userModel
      .findById(user._id)
      .select('-password -updatedAt -createdAt -token');

    if (!foundUser) {
      throw new UnauthorizedException(
        'User is not available! Please register or login again!',
      );
    }
    return foundUser;
  }

  async updateUser(
    dto: UserUpdateDto,
    user: UserResponseDto,
    file: Express.Multer.File,
  ): Promise<User> {
    if (Object.keys(dto).length === 0 && !file) {
      throw new BadRequestException('At least one field is required!');
    }

    const userToUpdate: UserResponseDto = await this.userModel.findById(
      user._id,
    );

    if (!userToUpdate) {
      throw new NotFoundException('No such user!');
    }

    if (file) {
      const avatar = await this.filesService.changeAvatar(file, userToUpdate);
      await this.userModel.findByIdAndUpdate(user._id, { avatar });
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(user._id, dto, {
        new: true,
      })
      .select('-updatedAt -createdAt -password -token');
    return updatedUser;
  }
}
