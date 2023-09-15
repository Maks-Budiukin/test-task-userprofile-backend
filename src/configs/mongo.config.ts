import { ConfigService } from '@nestjs/config';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';

export const mongoConfig = async (
  configService: ConfigService,
): Promise<MongooseModuleFactoryOptions> => {
  return {
    uri:
      'mongodb+srv://' +
      configService.get('MONGO_LOGIN') +
      ':' +
      configService.get('MONGO_PASSWORD') +
      '@' +
      configService.get('MONGO_HOST') +
      '/' +
      configService.get('MONGO_DATABASE') +
      '?' +
      configService.get('MONGO_OPTIONS'),
  };
};
