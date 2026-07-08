import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { streamText, generateText, tool } from 'ai';
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
      Eres Neo, el asesor de hardware de NeoHW, una tienda de componentes de PC en Ecuador.
      
      Reglas de Formato (OBLIGATORIAS):
      1. Sé breve y directo. Responde en máximo 2-3 párrafos cortos. NO escribas ensayos largos.
      2. Usa Markdown: **negrita** para nombres de productos y listas con viñetas (-) para presentar componentes.
      3. Cuando presentes un armado o presupuesto, usa una tabla Markdown con columnas: Componente | Producto | Precio.
      4. Termina con UNA pregunta corta para continuar la conversación.
      5. Usa emojis con moderación (máximo 2-3 por respuesta).
      
      Reglas Técnicas:
      1. NUNCA inventes productos ni compatibilidades. SIEMPRE usa 'searchProducts' antes de mencionar cualquier componente.
      2. NO digas "voy a buscar" ni pidas permiso. Ejecuta la herramienta en silencio y responde después.
      3. Estrategia de Búsqueda (MUY IMPORTANTE): Usa palabras clave cortas y precisas en el campo 'query'. NO escribas frases largas ni descriptivas.
         - CORRECTO: query: "i9" o query: "RTX 4090" o query: "DDR5 32GB"
         - INCORRECTO: query: "procesador gama alta gaming" o query: "tarjeta de video gama alta gaming RTX 4080 4090"
         Combina 'category' con 'query' para mejores resultados. Ejemplo: category: "procesadores", query: "i9"
      4. Para armados completos, busca por categoría: "procesadores", "placas-madres", "memorias-ram", "tarjetas-graficas", "fuentes-de-poder", "almacenamiento", "gabinetes".
      5. Si un producto tiene bajo stock, menciónalo brevemente.
      6. IDs de Productos: Al final de tu respuesta, incluye TODOS los IDs de los productos que recomiendas con este formato exacto: ###RECOMMENDED_IDS: [id1, id2, id3, ...]###
      7. CRÍTICO: Siempre debes finalizar tu turno escribiendo una respuesta en texto para el usuario, nunca te quedes solo ejecutando herramientas.
    `;

    return generateText({
      model,
      system: systemPrompt,
      messages: messages as any,
      maxSteps: 30, // Aumentado a 15 para evitar que se quede sin pasos al armar una PC completa
      tools: {
        searchProducts: tool({
          description: 'Busca productos de hardware en el catálogo de NeoHW.',
          parameters: z.object({
            query: z.string().optional().describe('Texto de búsqueda general (ej: "procesador gaming", "ram ddr5")'),
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
              args.query,
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
            
            // Devolver un array de strings simples en lugar de JSON complejo para evitar confundir a Gemini
            return result.data.map((p: any) => {
              let stockStatus = 'En stock';
              if (p.stock <= 0) stockStatus = 'AGOTADO';
              else if (p.stock <= 3) stockStatus = `¡Últimas ${p.stock} unidades!`;

              const attributes = p.attributes.map((a: any) => `${a.name}: ${a.value}${a.unit ? ` ${a.unit}` : ''}`).join(', ');
              return `[ID: ${p.id}] ${p.name} (${p.brand}) - Precio: $${p.price} - Stock: ${stockStatus} - Cat: ${p.category?.name || 'N/A'} - Detalles: ${attributes}`;
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

  // Método de reintento: fuerza a la IA a generar texto sin herramientas
  async chatTextOnly(messages: any[]): Promise<any> {
    const model = this.google('gemini-3.1-flash-lite');

    return generateText({
      model,
      system: `Eres Neo, el asesor de hardware de NeoHW. Genera una respuesta útil basándote en los resultados de las herramientas que ya ejecutaste. Sé breve, usa Markdown y tablas. Incluye ###RECOMMENDED_IDS: [id1, id2, ...]### al final con los IDs de productos que recomiendes.`,
      messages: messages as any,
      maxSteps: 1,
    } as any);
  }
}
