import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AiAgentService } from '../application/services/ai-agent.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiAgentService: AiAgentService) {}

  @Post('chat')
  async chat(@Body('messages') messages: Array<{role: string, content: string}>, @Res() res: Response) {
    const result = await this.aiAgentService.chat(messages);
    
    // Configuramos la cabecera para texto en streaming continuo
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    // Vercel AI SDK expone 'textStream' que es un iterador asíncrono.
    // Iteramos sobre él y escribimos cada pedacito nativamente en la respuesta de Express.
    for await (const chunk of result.textStream) {
      res.write(chunk);
    }
    
    res.end();
  }
}
