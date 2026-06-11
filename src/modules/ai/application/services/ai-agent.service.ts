import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { streamText, tool } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
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
  private google: ReturnType<typeof createGoogleGenerativeAI>;

  constructor(
    private readonly configService: ConfigService,
    @Inject(CHECK_COMPATIBILITY_USE_CASE)
    private readonly checkCompatibilityUseCase: CheckCompatibilityUseCase,
    @Inject(FIND_ALL_RULES_USE_CASE)
    private readonly findAllRulesUseCase: FindAllRulesUseCase,
    @Inject(FIND_ALL_PRODUCTS_USE_CASE)
    private readonly findAllProductsUseCase: FindAllProductsUseCase,
  ) {
    const apiKey = this.configService.get<string>('ai.geminiApiKey');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing');
    }
    
    // Inicializar el proveedor de Google (Gemini)
    this.google = createGoogleGenerativeAI({
      apiKey,
    });
  }

  async chat(messages: any[]): Promise<any> {
    // gemini-3.1-flash-lite: Modelo ligero y rápido recomendado como alternativa por Google (Junio 2026).
    const model = this.google('gemini-3.1-flash-lite');

    const systemPrompt = `
      Eres Neo, el Arquitecto Experto de Hardware de NeoHW, una tienda premium de componentes de PC en Ecuador.
      Tu objetivo es brindar la mejor asesoría técnica para armar computadoras, garantizando compatibilidad y guiando la compra.
      
      Reglas de Personalidad y Ventas (CRÍTICAS):
      1. Tono: Sé muy amable, entusiasta, empático y usa emojis para darle vida a la conversación.
      2. Formato Visual: Usa siempre Markdown. Resalta en **negrita** los nombres de los productos clave y usa listas con viñetas (-) cuando presentes opciones o presupuestos.
      3. Up-Selling (Recomendaciones Proactivas): Si el cliente elige un Procesador de gama media/alta, pregúntale sutilmente si ya cuenta con una buena placa madre o refrigeración adecuada. Ayúdale a armar el ecosistema completo.
      4. Cierre Conversacional: Termina SIEMPRE tus respuestas con una pregunta breve que invite al cliente a continuar (ej: "¿Te gustaría que revise si esto es compatible con tu fuente de poder?" o "¿Cuál es tu presupuesto estimado para este armado?").
      
      Reglas Técnicas y de Herramientas:
      1. NUNCA inventes o asumas compatibilidades. SIEMPRE usa la herramienta 'checkCompatibility' cuando el cliente quiera combinar dos piezas.
      2. ESTÁ ESTRICTAMENTE PROHIBIDO mencionar nombres, modelos o características sin haber ejecutado ANTES la herramienta 'searchProducts'.
      CRÍTICO: NO digas "Voy a buscar", NO pidas permiso para buscar, y NO uses frases de relleno antes de buscar. ¡SIMPLEMENTE EJECUTA LA HERRAMIENTA EN SILENCIO DE INMEDIATO! Redacta tu respuesta SOLO DESPUÉS de ver los resultados de la base de datos de NeoHW.
      3. Si la herramienta 'searchProducts' devuelve que un producto tiene bajo stock, menciónale al cliente que quedan pocas unidades para generar sentido de oportunidad.
    `;

    return streamText({
      model,
      system: systemPrompt,
      messages: messages as any,
      maxSteps: 5, // Permitir ciclos múltiples de razonamiento y uso de herramientas
      tools: {
        searchProducts: tool({
          description: 'Busca productos de hardware en el catálogo de NeoHW.',
          parameters: z.object({
            category: z.string().optional().describe('Slug de categoría (ej: "procesadores", "placas-madres", "memorias-ram")'),
            categoria: z.string().optional().describe('Alias de category en español'),
            brand: z.string().optional().describe('Marca (ej: "Intel", "AMD", "ASUS", "NVIDIA")'),
            marca: z.string().optional().describe('Alias de brand en español'),
            manufacturer: z.string().optional().describe('Alias de brand in English'),
            search: z.string().optional().describe('Texto libre para buscar por nombre o descripción (ej: "Ryzen 5 5600X")'),
            model: z.string().optional().describe('Alias de search in English'),
            modelo: z.string().optional().describe('Alias de search en español'),
            tipo: z.string().optional().describe('Tipo de componente'),
            type: z.string().optional().describe('Type of component'),
            ligne: z.string().optional().describe('Línea o gama del componente (ej: "Ryzen")'),
            series: z.string().optional().describe('Serie del componente (ej: "5000")'),
            presupuesto: z.union([z.string(), z.number()]).optional().describe('Presupuesto máximo'),
            budget: z.union([z.string(), z.number()]).optional().describe('Maximum budget'),
            limit: z.number().optional().describe('Límite de resultados (máx 20)'),
          }),
          execute: async (args: any) => {
            console.log('⚡ [AI TOOL CALLED] searchProducts ejecutado con argumentos:', args);
            const category = args.category || args.categoria;
            const brand = args.brand || args.marca || args.manufacturer;
            
            // Fusión de términos de búsqueda para no perder precisión en el catálogo
            const searchParts = [
              args.search,
              args.model,
              args.modelo,
              args.ligne,
              args.series,
              args.tipo,
              args.type
            ].filter(Boolean);
            const search = searchParts.length > 0 ? searchParts.join(' ') : undefined;
            const limit = args.limit ?? 10;
            
            const result = await this.findAllProductsUseCase.execute({
              filters: { category, brand, search, isActive: true },
              page: 1,
              limit,
              sort: 'price',
              order: 'asc',
            });
            
            return result.data.map((p: any) => {
              let stockStatus = 'En stock';
              if (p.stock <= 0) stockStatus = 'AGOTADO';
              else if (p.stock <= 3) stockStatus = `¡Últimas ${p.stock} unidades!`;

              return {
                id: p.id,
                name: p.name,
                brand: p.brand,
                price: p.price,
                stockAvailability: stockStatus,
                category: p.category.name,
                attributes: p.attributes.map((a: any) => `${a.name}: ${a.value}${a.unit ? ` ${a.unit}` : ''}`)
              };
            });
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
              return { error: 'Error interno: Dile amablemente al cliente que no pudiste verificar la compatibilidad en este momento, y pídele que sea más específico con el modelo o nombre exacto del producto.' };
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
      } as any
    } as any);
  }
}
