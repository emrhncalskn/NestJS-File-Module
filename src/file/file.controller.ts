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

  @Post('upload/file/:route')
  @ApiConsumes('multipart/form-data')
  @ApiBody(FileApiOptions())
  @UseInterceptors(FileInterceptor('file', FileUploadOptions()))
  async uploadImage(@Body() files: FileDto, @Param('route') route: string, @UploadedFile(new ParseFilePipe({
    validators: [
      new FileTypeValidator({ fileType: FileTypeConstant.FILE })]
  })) file: Express.Multer.File) {
    const type = file.mimetype.split('/')[1]
    files.filename = file.filename
    files.path = file.path
    files.alt = await this.fileService.fillEmpty(file.originalname)
    return await this.fileService.uploadFile(files, route, type)
  }

  @Get()
  async getFiles() {
    return await this.fileService.getFiles();
  }

  @Get('get/byid/:id')
  async getFileById(@Param('id') id: number) {
    return await this.fileService.findFileById(id);
  }

  @Get('get/bytype')
  async getFileByType(@Param('type_id') type_id: number) {
    return await this.fileService.getFilesByType(type_id);
  }

  @Get('get/type/:name')
  async getFileType(@Param('name') name: string) {
    return await this.fileService.findFileType(name);
  }

  @Get('get/types')
  async getTypes() {
    await this.fileService.getTypesRegexFormat();
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
}