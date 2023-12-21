import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { FileTypeConstant } from './options/file.constant';

@Module({
  imports: [FileTypeConstant],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule { }
