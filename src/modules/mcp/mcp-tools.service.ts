import { Inject, Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';

import {
  CHECK_COMPATIBILITY_USE_CASE,
  FIND_ALL_RULES_USE_CASE,
} from '../compatibility/compatibility.tokens';
import { FIND_ALL_PRODUCTS_USE_CASE } from '../products/products.tokens';
import type { CheckCompatibilityUseCase } from '../compatibility/application/use-cases/check-compatibility.use-case';
import type { FindAllRulesUseCase } from '../compatibility/application/use-cases/find-all-rules.use-case';
import type { FindAllProductsUseCase } from '../products/application/use-cases/find-all-products.use-case';

/**
 * Servicio MCP que expone las herramientas (Tools) del dominio de NeoHW
 * para que un Agente de IA (LLM) pueda invocarlas a través del protocolo MCP.
 *
 * Principio: Este servicio es un ADAPTADOR puro.
 * No contiene lógica de negocio; solo traduce entre el formato MCP
 * y los Use Cases existentes del dominio.
 */
@Injectable()
export class McpToolsService {
  constructor(
    @Inject(CHECK_COMPATIBILITY_USE_CASE)
    private readonly checkCompatibilityUseCase: CheckCompatibilityUseCase,

    @Inject(FIND_ALL_RULES_USE_CASE)
    private readonly findAllRulesUseCase: FindAllRulesUseCase,

    @Inject(FIND_ALL_PRODUCTS_USE_CASE)
    private readonly findAllProductsUseCase: FindAllProductsUseCase,
  ) {}

  // ─── Tool 1: Verificar Compatibilidad entre Componentes ─────────

  @Tool({
    name: 'check_compatibility',
    description:
      'Verifica si un conjunto de componentes de hardware (CPU, motherboard, RAM, GPU, PSU, etc.) son compatibles entre sí. ' +
      'Recibe un array de IDs de productos y evalúa las reglas de compatibilidad registradas en el sistema. ' +
      'Retorna si el conjunto es compatible y el detalle de cada regla evaluada.',
    parameters: z.object({
      productIds: z
        .array(z.string().uuid())
        .min(2, 'Se requieren al menos 2 productos para verificar compatibilidad')
        .describe('Array de UUIDs de los productos a verificar'),
    }),
  })
  async checkCompatibility({ productIds }: { productIds: string[] }) {
    try {
      const result = await this.checkCompatibilityUseCase.execute({ productIds });

      const summary = result.compatible
        ? '✅ Todos los componentes son compatibles entre sí.'
        : '❌ Se encontraron incompatibilidades entre los componentes.';

      const details = result.results
        .map((r) => {
          const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
          return `${icon} [${r.ruleName}] ${r.sourceProduct.name} ↔ ${r.targetProduct.name}: ${r.detail}`;
        })
        .join('\n');

      return {
        content: [
          {
            type: 'text' as const,
            text: `${summary}\n\nResultado general: ${result.compatible ? 'COMPATIBLE' : 'INCOMPATIBLE'}\n\nDetalle de evaluación:\n${details}`,
          },
        ],
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      return {
        content: [{ type: 'text' as const, text: `Error al verificar compatibilidad: ${message}` }],
        isError: true,
      };
    }
  }

  // ─── Tool 2: Listar Reglas de Compatibilidad Activas ────────────

  @Tool({
    name: 'list_compatibility_rules',
    description:
      'Lista todas las reglas de compatibilidad registradas en el sistema. ' +
      'Cada regla define cómo se valida la relación entre dos atributos de hardware ' +
      '(por ejemplo: socket del CPU debe coincidir con socket del motherboard). ' +
      'Usa esta herramienta para entender qué validaciones existen antes de verificar compatibilidad.',
    parameters: z.object({}),
  })
  async listCompatibilityRules() {
    try {
      const rules = await this.findAllRulesUseCase.execute();

      if (rules.length === 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text: 'No hay reglas de compatibilidad registradas en el sistema.',
            },
          ],
        };
      }

      const formatted = rules
        .map((r) => {
          const status = r.isActive ? '🟢 Activa' : '🔴 Inactiva';
          return (
            `• ${r.name} (${status})\n` +
            `  Tipo: ${r.ruleType}\n` +
            `  Atributo origen: ${r.sourceAttributeName}\n` +
            `  Atributo destino: ${r.targetAttributeName}\n` +
            `  Condición: ${JSON.stringify(r.condition)}`
          );
        })
        .join('\n\n');

      return {
        content: [
          {
            type: 'text' as const,
            text: `Reglas de compatibilidad registradas (${rules.length}):\n\n${formatted}`,
          },
        ],
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      return {
        content: [{ type: 'text' as const, text: `Error al listar reglas: ${message}` }],
        isError: true,
      };
    }
  }

  // ─── Tool 3: Buscar Productos por Filtros ───────────────────────

  @Tool({
    name: 'search_products',
    description:
      'Busca productos de hardware en el catálogo aplicando filtros opcionales. ' +
      'Permite filtrar por categoría, marca, rango de precios y texto libre. ' +
      'Retorna una lista paginada con los detalles de cada producto incluyendo sus atributos técnicos.',
    parameters: z.object({
      category: z.string().optional().describe('Slug de la categoría (ej: "procesadores", "motherboards")'),
      brand: z.string().optional().describe('Marca del producto (ej: "Intel", "AMD", "NVIDIA")'),
      minPrice: z.number().optional().describe('Precio mínimo en la moneda del sistema'),
      maxPrice: z.number().optional().describe('Precio máximo en la moneda del sistema'),
      search: z.string().optional().describe('Texto libre para buscar en nombre, descripción o modelo'),
      page: z.number().int().positive().optional().default(1).describe('Número de página'),
      limit: z.number().int().positive().max(50).optional().default(10).describe('Productos por página (máx 50)'),
    }),
  })
  async searchProducts(params: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const result = await this.findAllProductsUseCase.execute({
        filters: {
          category: params.category,
          brand: params.brand,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          search: params.search,
          isActive: true,
        },
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        sort: 'price',
        order: 'asc',
      });

      if (result.data.length === 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text: 'No se encontraron productos con los filtros especificados.',
            },
          ],
        };
      }

      const products = result.data
        .map((p) => {
          const attrs = p.attributes
            .map((a) => `    - ${a.name}: ${a.value}${a.unit ? ` ${a.unit}` : ''}`)
            .join('\n');

          return (
            `📦 ${p.name}\n` +
            `   ID: ${p.id}\n` +
            `   Marca: ${p.brand ?? 'N/A'} | Modelo: ${p.model ?? 'N/A'}\n` +
            `   Precio: $${p.price} | Stock: ${p.stock}\n` +
            `   Categoría: ${p.category.name}\n` +
            `   Atributos técnicos:\n${attrs}`
          );
        })
        .join('\n\n');

      return {
        content: [
          {
            type: 'text' as const,
            text:
              `Productos encontrados: ${result.meta.total} (mostrando página ${result.meta.page}/${result.meta.totalPages})\n\n` +
              products,
          },
        ],
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      return {
        content: [{ type: 'text' as const, text: `Error al buscar productos: ${message}` }],
        isError: true,
      };
    }
  }
}
