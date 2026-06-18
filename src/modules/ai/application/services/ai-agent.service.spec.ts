import { Test, TestingModule } from '@nestjs/testing';
import { AiAgentService } from './ai-agent.service';
import { ConfigService } from '@nestjs/config';
import { mock, mockClear } from 'jest-mock-extended';
import {
  CHECK_COMPATIBILITY_USE_CASE,
  FIND_ALL_RULES_USE_CASE,
} from '../../../compatibility/compatibility.tokens';
import { FIND_ALL_PRODUCTS_USE_CASE } from '../../../products/products.tokens';

import type { CheckCompatibilityUseCase } from '../../../compatibility/application/use-cases/check-compatibility.use-case';
import type { FindAllRulesUseCase } from '../../../compatibility/application/use-cases/find-all-rules.use-case';
import type { FindAllProductsUseCase } from '../../../products/application/use-cases/find-all-products.use-case';

// Mocking external SDKs
jest.mock('ai', () => ({
  generateText: jest.fn(),
  tool: jest.fn().mockImplementation((config) => config),
}));

jest.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: jest.fn().mockReturnValue(jest.fn().mockReturnValue('mocked-model')),
}));

import { generateText } from 'ai';

describe('AiAgentService', () => {
  let service: AiAgentService;

  const configService = mock<ConfigService>();
  const checkCompatibilityUseCase = mock<CheckCompatibilityUseCase>();
  const findAllRulesUseCase = mock<FindAllRulesUseCase>();
  const findAllProductsUseCase = mock<FindAllProductsUseCase>();

  beforeEach(async () => {
    mockClear(configService);
    mockClear(checkCompatibilityUseCase);
    mockClear(findAllRulesUseCase);
    mockClear(findAllProductsUseCase);
    (generateText as jest.Mock).mockClear();

    // The service requires the API key on initialization
    configService.get.mockImplementation((key) => {
      if (key === 'ai.geminiApiKey') return 'test-api-key';
      return null;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiAgentService,
        { provide: ConfigService, useValue: configService },
        { provide: CHECK_COMPATIBILITY_USE_CASE, useValue: checkCompatibilityUseCase },
        { provide: FIND_ALL_RULES_USE_CASE, useValue: findAllRulesUseCase },
        { provide: FIND_ALL_PRODUCTS_USE_CASE, useValue: findAllProductsUseCase },
      ],
    }).compile();

    service = module.get<AiAgentService>(AiAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call generateText with correct messages and mocked model', async () => {
    const mockMessages = [{ role: 'user', content: 'Arma una PC' }];
    const mockResponse = { text: 'Claro, aquí tienes una PC' };
    
    (generateText as jest.Mock).mockResolvedValue(mockResponse);

    const result = await service.chat(mockMessages);

    expect(generateText).toHaveBeenCalled();
    const generateTextArgs = (generateText as jest.Mock).mock.calls[0][0];
    
    expect(generateTextArgs.messages).toEqual(mockMessages);
    expect(generateTextArgs.maxSteps).toBe(5);
    expect(generateTextArgs.tools).toHaveProperty('searchProducts');
    expect(generateTextArgs.tools).toHaveProperty('checkCompatibility');
    expect(result).toEqual(mockResponse);
  });

  it('should execute searchProducts tool successfully', async () => {
    // We capture the tool and execute it manually to test its logic
    await service.chat([]);
    const generateTextArgs = (generateText as jest.Mock).mock.calls[0][0];
    const searchTool = generateTextArgs.tools.searchProducts;

    const mockPaginatedProducts = {
      data: [
        { id: '1', name: 'RTX 3060', brand: 'NVIDIA', price: 300, stock: 2, attributes: [{ name: 'VRAM', value: '12', unit: 'GB' }] }
      ],
      total: 1,
      page: 1,
      limit: 3
    };

    findAllProductsUseCase.execute.mockResolvedValue(mockPaginatedProducts as any);

    const toolResult = await searchTool.execute({ category: 'gpu', brand: 'NVIDIA' });

    expect(findAllProductsUseCase.execute).toHaveBeenCalledWith({
      filters: { category: 'gpu', brand: 'NVIDIA', search: undefined, isActive: true },
      page: 1,
      limit: 3,
      sort: 'price',
      order: 'asc',
    });
    // Verificamos que devuelve el array de strings simple que le gusta a Gemini
    expect(toolResult[0]).toContain('[ID: 1] RTX 3060 (NVIDIA)');
    expect(toolResult[0]).toContain('¡Últimas 2 unidades!');
    expect(toolResult[0]).toContain('VRAM: 12 GB');
  });

  it('should execute checkCompatibility tool successfully', async () => {
    await service.chat([]);
    const generateTextArgs = (generateText as jest.Mock).mock.calls[0][0];
    const checkTool = generateTextArgs.tools.checkCompatibility;

    const mockUseCaseResult = {
      compatible: false,
      results: [
        { ruleName: 'Socket Match', sourceProduct: { name: 'CPU' }, targetProduct: { name: 'Mobo' }, status: 'FAIL', detail: 'Mismatch' }
      ]
    };

    checkCompatibilityUseCase.execute.mockResolvedValue(mockUseCaseResult as any);

    const toolResult = await checkTool.execute({ productIds: ['1', '2'] });

    expect(checkCompatibilityUseCase.execute).toHaveBeenCalledWith({ productIds: ['1', '2'] });
    expect(toolResult.compatible).toBe(false);
    expect(toolResult.details[0]).toContain('[Socket Match] CPU vs Mobo: FAIL - Mismatch');
  });
});
