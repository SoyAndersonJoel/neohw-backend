import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { streamText, tool } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';

import {
  CHECK_COMPATIBILITY_USE_CASE,
  FIND_ALL_RULES_USE_CASE,
} from '../../../compatibility/compatibility.tokens';
import { FIND_ALL_PRODUCTS_USE_CASE } from '../../../products/products.tokens';
import type { CheckCompatibilityUseCase } from '../../../compatibility/application/use-cases/check-compatibility.use-case';
import type { FindAllRulesUseCase } from '../../../compatibility/application/use-cases/find-all-rules.use-case';
import type { FindAllProductsUseCase } from '../../../products/application/use-cases/find-all-products.use-case';

@Injectable()
export class AiAgentService {
  private groq: ReturnType<typeof createGroq>;

  constructor(
    private readonly configService: ConfigService,
    @Inject(CHECK_COMPATIBILITY_USE_CASE)
    private readonly checkCompatibilityUseCase: CheckCompatibilityUseCase,
    @Inject(FIND_ALL_RULES_USE_CASE)
    private readonly findAllRulesUseCase: FindAllRulesUseCase,
    @Inject(FIND_ALL_PRODUCTS_USE_CASE)
    private readonly findAllProductsUseCase: FindAllProductsUseCase,
  ) {
    const apiKey = this.configService.get<string>('ai.groqApiKey');
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is missing');
    }
    
    // Inicializar el proveedor de Groq
    this.groq = createGroq({
      apiKey,
    });
  }

  async chat(messages: any[]): Promise<any> {
    // Usamos Llama-3.3 70B vía Groq por ser ultra rápido y soportar tool calling perfectamente
    const model = this.groq('llama-3.3-70b-versatile');

    const systemPrompt = `
      Eres el Arquitecto de Hardware y Asistente Experto de NeoHW, una tienda de componentes de PC.
      Tu objetivo es ayudar a los clientes a armar computadoras, recomendar piezas y verificar que todo sea compatible.
      
      Reglas cruciales:
      1. NUNCA inventes o asumas compatibilidades. SIEMPRE usa la herramienta 'check_compatibility'.
      2. NUNCA inventes productos o precios. SIEMPRE usa la herramienta 'search_products' para ver qué hay en inventario.
      3. Si el cliente pide armar una PC desde cero, busca primero las piezas clave (CPU, Motherboard), verifica su compatibilidad, y luego recomiéndalas.
      4. Sé amable, técnico pero fácil de entender, y usa emojis para hacer la lectura agradable.
      5. Si un producto no está en el inventario al buscarlo, dile al cliente que por el momento no contamos con él.
    `;

    return streamText({
      model,
      system: systemPrompt,
      messages: messages as any,
      tools: {
        searchProducts: tool({
          description: 'Busca productos de hardware en el catálogo de NeoHW.',
          parameters: z.object({
            category: z.string().optional().describe('Slug de categoría (ej: "procesadores")'),
            brand: z.string().optional().describe('Marca (ej: "Intel", "AMD")'),
            search: z.string().optional().describe('Texto libre para buscar'),
            limit: z.number().optional().describe('Límite de resultados (máx 20)'),
          }),
          execute: async (args: any) => {
            const { category, brand, search, limit } = args;
            const result = await this.findAllProductsUseCase.execute({
              filters: { category, brand, search, isActive: true },
              page: 1,
              limit: limit ?? 10,
              sort: 'price',
              order: 'asc',
            });
            
            return result.data.map((p: any) => ({
              id: p.id,
              name: p.name,
              brand: p.brand,
              price: p.price,
              stock: p.stock,
              category: p.category.name,
              attributes: p.attributes.map((a: any) => `${a.name}: ${a.value}${a.unit ? ` ${a.unit}` : ''}`)
            }));
          },
        } as any),

        checkCompatibility: tool({
          description: 'Verifica la compatibilidad entre dos o más componentes de hardware usando sus IDs.',
          parameters: z.object({
            productIds: z.array(z.string()).min(2).describe('Array de UUIDs de los productos a comparar'),
          }),
          execute: async (args: any) => {
            const { productIds } = args;
            try {
              const result = await this.checkCompatibilityUseCase.execute({ productIds });
              return {
                compatible: result.compatible,
                details: result.results.map((r: any) => 
                  `[${r.ruleName}] ${r.sourceProduct.name} vs ${r.targetProduct.name}: ${r.status} - ${r.detail}`
                )
              };
            } catch (error) {
              return { error: error instanceof Error ? error.message : 'Error de compatibilidad' };
            }
          },
        } as any),

        listRules: tool({
          description: 'Lista todas las reglas de compatibilidad que el motor utiliza actualmente.',
          parameters: z.object({}),
          execute: async () => {
            const rules = await this.findAllRulesUseCase.execute();
            return rules.map((r: any) => ({
              name: r.name,
              type: r.ruleType,
              source: r.sourceAttributeName,
              target: r.targetAttributeName
            }));
          },
        } as any)
      }
    });
  }
}
