import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; 
import { PrismaService } from '../prisma/prisma.service';
import * as tesseract from 'tesseract.js';
import * as path from 'path';
import OpenAI from 'openai';

@Injectable()
export class DocumentsService {
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService 
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    console.log('--- DEBUG ---');
    console.log('Lendo chave da API:', apiKey ? apiKey.substring(0, 5) + '...' : 'NÃO ENCONTRADA');
    console.log('--- DEBUG ---');

    if (!apiKey) {
      throw new Error('A chave OPENAI_API_KEY não está definida no arquivo .env');
    }

    this.openai = new OpenAI({
      apiKey: apiKey, 
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async create(file: Express.Multer.File, userId: string) {
    const filePath = path.resolve(process.cwd(), file.path);
    console.log('Iniciando OCR na imagem:', file.originalname);
    
    const { data: { text } } = await tesseract.recognize(filePath, 'por');
    console.log('OCR concluído!');

    return this.prisma.document.create({
      data: {
        filename: file.originalname,
        path: file.path,
        extractedText: text,
        userId: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.document.findMany();
  }

  async askQuestion(documentId: string, question: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || !document.extractedText) {
      throw new NotFoundException('Documento ou texto não encontrado.');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Você é um assistente útil e preciso. 
            Responda à pergunta do usuário baseando-se ESTRITAMENTE no seguinte contexto extraído de um documento. 
            Se a resposta não estiver no texto, diga que não sabe.
            
            --- TEXTO DO DOCUMENTO ---
            ${document.extractedText}`
          },
          { role: 'user', content: question },
        ],
        model: 'llama-3.3-70b-versatile', 
      });

      const answer = completion.choices[0].message.content;

      await this.prisma.message.create({
        data: { content: question, role: 'USER', documentId: document.id },
      });

      await this.prisma.message.create({
        data: { content: answer || '', role: 'ASSISTANT', documentId: document.id },
      });

      return { answer };

    } catch (error) {
      console.error('⚠️ Erro na chamada da AI:', error);
      
      const fallbackAnswer = "Desculpe, não consegui processar a resposta com a IA neste momento (Verifique a API Key ou Cotas). Mas o texto do seu documento foi extraído e salvo com sucesso!";

      await this.prisma.message.create({
        data: { content: question, role: 'USER', documentId: document.id },
      });

      await this.prisma.message.create({
        data: { content: fallbackAnswer, role: 'ASSISTANT', documentId: document.id },
      });

      return { answer: fallbackAnswer };
    }
  }
}