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

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  sendAuthEmail(): void {
    this.mailerService.sendMail({
      to: 'reg.zlodeyushka@gmail.com', // list of receivers
      from: 'nodemailer.maxtest@gmail.com', // sender address
      subject: 'Testing Nest MailerModule ✔', // Subject line
      text: 'welcome', // plaintext body
    });
  }

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
    console.log('TOKEN', token);
    console.log('EMAIL', email);
    this.mailerService
      .sendMail({
        to: `${email}`, // list of receivers
        from: 'noreply', // sender address
        subject: 'Testing Nodemailer', // Subject line
        text: `localhost:4000/api/user/${token}`, // plaintext body
        // html: '<b>welcome</b>',
      })
      .then((success) => {
        console.log(success);
      })
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
    console.log('USER IN LOGIN', user);
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

  async updateUser(dto: UserUpdateDto, user: UserResponseDto): Promise<User> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one field required!');
    }

    const userToUpdate = await this.userModel.findById(user._id);

    if (!userToUpdate) {
      throw new NotFoundException('No such user!');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(user._id, dto, {
        new: true,
      })
      .select('-updatedAt -createdAt -password -token');
    return updatedUser;
  }
}
