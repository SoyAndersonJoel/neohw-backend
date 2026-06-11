import { Body, Controller, Post, Res, HttpStatus } from '@nestjs/common';
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
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Debe proporcionar un array de "messages" o un campo "prompt" de tipo string.',
          error: 'Bad Request',
        });
      }

      let result = await this.aiAgentService.chat(messagesArray);
      let fullText = result.text;

      // Failsafe: Si la IA ejecutó herramientas pero no redactó un texto final (comportamiento a veces errático de Gemini),
      // forzamos manualmente un segundo paso enviándole el historial con los resultados de las herramientas.
      if (!fullText && result.response?.messages?.length > 0) {
        const historyWithTools = [...messagesArray, ...result.response.messages];
        result = await this.aiAgentService.chat(historyWithTools);
        fullText = result.text || 'He revisado el inventario pero no he podido formular una respuesta en este momento.';
      }

      // Respuesta JSON limpia y predecible para cualquier cliente (Insomnia, Postman, Frontend)
      return res.status(HttpStatus.OK).json({
        role: 'assistant',
        content: fullText,
      });
    } catch (error: any) {
      console.error('Error en el chat con la IA:', error);

      // Detectar errores de cuota/rate-limit de Gemini
      const isRateLimited =
        error?.statusCode === 429 ||
        error?.message?.includes('quota') ||
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.lastError?.statusCode === 429;

      if (isRateLimited) {
        return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'La IA está temporalmente saturada. Por favor espera unos segundos e intenta de nuevo.',
          error: 'Too Many Requests',
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al procesar la solicitud con la IA.',
        details: error.message || 'Error desconocido',
      });
    }
  }
}
