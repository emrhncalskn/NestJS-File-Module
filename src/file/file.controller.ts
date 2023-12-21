import { Body, Controller, FileTypeValidator, Get, Param, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileTypeConstant } from './options/file.constant';
import { FileTypeDto, FileDto } from './dto/file.dto';
import { FileService } from './file.service';
import { FileApiOptions, FileUploadOptions } from './options/file.options';
import { ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('File')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) { }

  @Post('upload/:route')
  @ApiConsumes('multipart/form-data')
  @ApiBody(FileApiOptions())
  @UseInterceptors(FileInterceptor('file', FileUploadOptions()))
  async uploadImage(@Param('route') route: string, @UploadedFile(new ParseFilePipe({
    validators: [
      new FileTypeValidator({ fileType: FileTypeConstant.FILE })]
  })) file: Express.Multer.File) {

    FileTypeConstant.setFileTypes(await this.fileService.getFileTypes());
    return await this.fileService.uploadFile(file, route);

  }

  @Get()
  async getFiles() {
    return await this.fileService.getFiles();
  }

  @Get('byid/:id')
  async getFileById(@Param('id') id: number) {
    return await this.fileService.findFileById(id);
  }

  @Get('bytype/:type')
  async getFileByType(@Param('type') type: string) {
    return await this.fileService.getFilesByType(type);
  }

  @Get('type/:name')
  async getFileType(@Param('name') name: string) {
    return await this.fileService.findFileType(name);
  }

  @Get('types')
  async getTypes() {
    return await this.fileService.getFileTypes();
  }

  @Get('list/:path')
  async listFilePaths(@Param('path') path: string) {
    return await this.fileService.listFilePaths(path);
  }

  @Post('create/type')
  async createFileType(@Body() type: FileTypeDto) {
    return await this.fileService.createFileType(type);
  }

  @Get('delete/:id')
  async deleteFile(@Param('id') id: number) {
    return await this.fileService.deleteFile(id);
  }
}