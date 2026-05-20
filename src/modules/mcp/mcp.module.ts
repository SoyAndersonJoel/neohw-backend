import { Module } from '@nestjs/common';
import { McpModule as McpNestModule } from '@rekog/mcp-nest';
import { CompatibilityModule } from '../compatibility/compatibility.module';
import { ProductsModule } from '../products/products.module';
import { McpToolsService } from './mcp-tools.service';

/**
 * Módulo MCP — Servidor de Model Context Protocol para NeoHW.
 *
 * Este módulo expone las capacidades del backend (motor de compatibilidad,
 * catálogo de productos) como herramientas (Tools) que un Agente de IA
 * puede invocar a través del protocolo estándar MCP.
 *
 * Arquitectura:
 * ┌──────────────────────────┐
 * │   LLM (Claude/GPT/etc)  │
 * └──────────┬───────────────┘
 *            │ MCP Protocol (Streamable HTTP)
 * ┌──────────▼───────────────┐
 * │   McpModule (Adaptador)  │ ← Este módulo
 * │   - McpToolsService      │
 * └──────────┬───────────────┘
 *            │ Inyección de Dependencias (NestJS DI)
 * ┌──────────▼───────────────┐
 * │   Domain Use Cases       │
 * │   - CheckCompatibility   │
 * │   - FindAllProducts      │
 * │   - FindAllRules         │
 * └──────────────────────────┘
 *
 * Transporte:
 * El servidor MCP se expone en la ruta /mcp vía Streamable HTTP,
 * compatible con Claude Desktop, Cursor, y cualquier cliente MCP estándar.
 */
@Module({
  imports: [
    McpNestModule.forRoot({
      name: 'neohw-mcp-server',
      version: '1.0.0',
    }),
    CompatibilityModule,
    ProductsModule,
  ],
  providers: [McpToolsService],
})
export class McpModule {}
