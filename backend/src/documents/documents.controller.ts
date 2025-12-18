import { Controller, Post, UseInterceptors, UploadedFile, Body, Get, Param, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)/ }),
        ],
      }),
    ) file: Express.Multer.File,
    @Body('userId') userId: string
  ) {
    return this.documentsService.create(file, userId);
  }

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }

  @Post(':id/chat')
  async chat(
    @Param('id') id: string,        
    @Body('question') question: string 
  ) {
    return this.documentsService.askQuestion(id, question);
  }
}