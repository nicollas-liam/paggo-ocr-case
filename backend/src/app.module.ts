import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocumentsModule } from './documents/documents.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module'; 

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DocumentsModule,
    AuthModule, 
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}