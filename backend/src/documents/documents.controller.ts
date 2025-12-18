import { Controller, Post, UseInterceptors, UploadedFile, Body, Get, Param } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
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
