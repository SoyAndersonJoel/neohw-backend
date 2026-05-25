import { Module, Global } from '@nestjs/common';
import { CloudinaryService } from './application/services/cloudinary.service';
import { STORAGE_SERVICE } from './storage.tokens';

@Global()
@Module({
  providers: [
    {
      provide: STORAGE_SERVICE,
      useClass: CloudinaryService,
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
