import { Body, Controller, FileTypeValidator, Get, Param, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileTypeConstant } from './options/file.constant';
import { UploadFileDto } from './dto/file.dto';
import { FileService } from './file.service';
import { FileApiOptions, FileUploadOptions } from './options/file.options';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) { }

  @Get('documents/:route')
  async getFileMenus(@Param('route') type: string) {
    return await this.fileService.getFileMenus(type);
  }

  /*@Get('images/:route')
  async getImageMenus(@Param('route') type: string) {
    return await this.fileService.getImageMenus(type);
  }*/

  @Post('upload/file/:route')
  @ApiConsumes('multipart/form-data')
  @ApiBody(FileApiOptions())
  @UseInterceptors(FileInterceptor('file', FileUploadOptions()))
  async uploadImage(@Body() files: UploadFileDto, @Param('route') route: string, @UploadedFile(new ParseFilePipe({
    validators: [
      new FileTypeValidator({ fileType: FileTypeConstant.FILE })]
  })) file: Express.Multer.File) {
    const type = file.mimetype.split('/')[1]
    files.filename = file.filename
    files.path = file.path
    files.alt = await this.fileService.fillEmptyWithUnderline(file.originalname)
    return await this.fileService.uploadFile(files, route, type)
  }
}