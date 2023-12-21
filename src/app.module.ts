import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileModule } from './file/file.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FileDestinationConstant } from './file/options/file.constant';

@Module({
  imports: [FileModule, ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', FileDestinationConstant.DEST),
  }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
