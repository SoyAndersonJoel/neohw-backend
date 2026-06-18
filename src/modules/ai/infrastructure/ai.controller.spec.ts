import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiAgentService } from '../application/services/ai-agent.service';
import { HttpStatus } from '@nestjs/common';
import { mock, mockClear } from 'jest-mock-extended';

describe('AiController', () => {
  let controller: AiController;
  const aiAgentService = mock<AiAgentService>();

  beforeEach(async () => {
    mockClear(aiAgentService);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        { provide: AiAgentService, useValue: aiAgentService },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  describe('chat', () => {
    it('should format simple prompt into messages array', async () => {
      const res = mockResponse();
      aiAgentService.chat.mockResolvedValue({ text: 'Hola' });

      await controller.chat(undefined as any, 'Quiero una PC', res);

      expect(aiAgentService.chat).toHaveBeenCalledWith([{ role: 'user', content: 'Quiero una PC' }]);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({ role: 'assistant', content: 'Hola' });
    });

    it('should execute failsafe loop if text is empty but tool calls happened', async () => {
      const res = mockResponse();
      
      // Primera llamada: text vacío pero con llamadas a herramientas en response.messages
      aiAgentService.chat.mockResolvedValueOnce({
        text: '',
        response: { messages: [{ role: 'tool', content: 'Tool Result' }] }
      } as any);

      // Segunda llamada: ya devuelve texto
      aiAgentService.chat.mockResolvedValueOnce({
        text: 'Después de usar mis herramientas, aquí tienes el resultado.',
      } as any);

      const messages = [{ role: 'user', content: 'Busca un Ryzen' }];
      await controller.chat(messages, '', res);

      expect(aiAgentService.chat).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        role: 'assistant',
        content: 'Después de usar mis herramientas, aquí tienes el resultado.',
      });
    });

    it('should catch rate limit errors and return 429 TOO_MANY_REQUESTS', async () => {
      const res = mockResponse();
      const error = new Error('RESOURCE_EXHAUSTED');
      
      aiAgentService.chat.mockRejectedValue(error);

      await controller.chat([{ role: 'user', content: 'x' }], '', res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.TOO_MANY_REQUESTS);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('La IA está temporalmente saturada'),
      }));
    });
  });
});
