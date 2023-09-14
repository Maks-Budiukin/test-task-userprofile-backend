import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserDocument } from 'src/user/user.model';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  @InjectModel(User.name)
  private readonly userModel: Model<UserDocument>;
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(_id: string): Promise<User> {
    const user = await this.userModel.findById(_id);

    if (!user) {
      throw new UnauthorizedException('Access denied!');
    }

    if (!user.token) {
      throw new UnauthorizedException('Please, re-login!');
    }

    return user;
  }
}
