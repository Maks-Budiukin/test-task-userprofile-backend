import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export class Avatar {
  large: string;
  medium: string;
  small: string;
}

export type UserDocument = HydratedDocument<User>;

@Schema({ versionKey: false, timestamps: true })
export class User {
  @Prop({ unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  name: string;

  @Prop({ default: null })
  number: string;

  @Prop({ default: null })
  linkedin: string;

  @Prop({ default: null })
  github: string;

  @Prop({ default: null })
  avatar: Avatar;

  @Prop({ default: null })
  token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
