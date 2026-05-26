import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AiAgentService } from '../application/services/ai-agent.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiAgentService: AiAgentService) {}

  @Post('chat')
  async chat(
    @Body('messages') messages: Array<{ role: string; content: string }>,
    @Body('prompt') prompt: string,
    @Res() res: Response,
  ) {
    try {
      let messagesArray = messages;

      // Si el cliente envía 'prompt' en lugar de 'messages', lo adaptamos al formato esperado
      if (!messagesArray && prompt) {
        messagesArray = [{ role: 'user', content: prompt }];
      }

      // Validación de entrada
      if (!messagesArray || !Array.isArray(messagesArray)) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Debe proporcionar un array de "messages" o un campo "prompt" de tipo string.',
          error: 'Bad Request',
        });
      }

      const result = await this.aiAgentService.chat(messagesArray);

      // Configuramos la cabecera para texto en streaming continuo
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      // Iteramos sobre el flujo de texto (textStream) que extrae automáticamente 
      // todo el texto, incluso si hay múltiples pasos (maxSteps) con herramientas de por medio.
      for await (const text of result.textStream) {
        if (text) {
          res.write(text);
        }
      }

      res.end();
    } catch (error: any) {
      // Si la cabecera ya se envió, no podemos responder con JSON, solo cerramos el stream.
      if (res.headersSent) {
        console.error('Error durante el streaming de la IA:', error);
        res.end();
      } else {
        console.error('Error al iniciar el chat con la IA:', error);
        res.status(500).json({
          statusCode: 500,
          message: 'Error al procesar la solicitud con la IA.',
          details: error.message || error,
        });
      }
    }
  }
}

