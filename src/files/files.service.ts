import { BadRequestException, Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { path } from 'app-root-path';
import { ensureDir, writeFile } from 'fs-extra';
import { UserResponseDto } from 'src/user/dto/user-response.dto';

@Injectable()
export class FilesService {
  async convertImages(file: Buffer) {
    const large = await sharp(file)
      .resize(800, null, { withoutEnlargement: true })
      .webp()
      .toBuffer();

    const medium = await sharp(file)
      .resize(500, null, { withoutEnlargement: true })
      .webp()
      .toBuffer();

    const small = await sharp(file)
      .resize(200, null, { withoutEnlargement: true })
      .webp()
      .toBuffer();

    return { large, medium, small };
  }

  async changeAvatar(file: Express.Multer.File, user: UserResponseDto) {
    if (!file.mimetype.includes('image')) {
      throw new BadRequestException('Please, upload only image files!');
    }

    // const userFolder = user._id;
    const uploadFolred = `${path}/avatars/`;

    ensureDir(uploadFolred);

    const images = await this.convertImages(file.buffer);

    await writeFile(`${uploadFolred}/${user._id}_X800.webp`, images.large);
    await writeFile(`${uploadFolred}/${user._id}_X500.webp`, images.medium);
    await writeFile(`${uploadFolred}/${user._id}_X200.webp`, images.small);

    const picturesSet = {
      large: `avatars/${user._id}_X800.webp`,
      medium: `avatars/${user._id}_X500.webp`,
      small: `avatars/${user._id}_X200.webp`,
    };

    return picturesSet;
  }
}
