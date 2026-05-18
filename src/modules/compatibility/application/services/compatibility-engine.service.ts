import {
  CompatibilityCheckResult,
  CompatibilityRuleWithAttributes,
} from '../../domain/entities/compatibility-rule.entity';

/**
 * Motor de compatibilidad puro (servicio de dominio).
 * Evalúa reglas contra los atributos de productos.
 * Diseñado para ser sustituible por un IACompatibilityEngine en el futuro.
 */
export class CompatibilityEngine {
  evaluate(
    rules: CompatibilityRuleWithAttributes[],
    products: Array<{
      id: string;
      name: string;
      attributes: Map<string, string>; // attributeId -> value
    }>,
  ): CompatibilityCheckResult[] {
    const results: CompatibilityCheckResult[] = [];

    for (const rule of rules) {
      // Buscar todos los pares de productos que tengan los atributos source/target
      for (let i = 0; i < products.length; i++) {
        for (let j = 0; j < products.length; j++) {
          if (i === j) continue;

          const source = products[i];
          const target = products[j];

          const sourceValue = source.attributes.get(rule.sourceAttributeId);
          const targetValue = target.attributes.get(rule.targetAttributeId);

          // Si ninguno de los dos tiene el atributo relevante, saltar
          if (!sourceValue && !targetValue) continue;

          // Si solo uno tiene el atributo, es un check incompleto
          if (!sourceValue || !targetValue) {
            results.push({
              ruleId: rule.id,
              ruleName: rule.name,
              status: 'SKIPPED',
              sourceProduct: { id: source.id, name: source.name },
              targetProduct: { id: target.id, name: target.name },
              detail: `Atributo faltante para evaluar la regla`,
            });
            continue;
          }

          const result = this.evaluateRule(rule, sourceValue, targetValue, source, target);
          results.push(result);
        }
      }
    }

    // Deduplicar pares (A↔B es lo mismo que B↔A para MUST_MATCH)
    return this.deduplicateResults(results);
  }

  private evaluateRule(
    rule: CompatibilityRuleWithAttributes,
    sourceValue: string,
    targetValue: string,
    sourceProduct: { id: string; name: string },
    targetProduct: { id: string; name: string },
  ): CompatibilityCheckResult {
    let status: 'PASS' | 'FAIL' | 'SKIPPED' = 'FAIL';
    let detail = '';

    switch (rule.ruleType) {
      case 'MUST_MATCH':
        if (sourceValue.toLowerCase() === targetValue.toLowerCase()) {
          status = 'PASS';
          detail = `Ambos coinciden: ${sourceValue}`;
        } else {
          detail = `No coinciden: ${sourceValue} vs ${targetValue}`;
        }
        break;

      case 'RANGE_CHECK': {
        const sourceNum = parseFloat(sourceValue);
        const targetNum = parseFloat(targetValue);
        const operator = rule.condition?.operator ?? 'lte';
        if (operator === 'lte' && sourceNum <= targetNum) {
          status = 'PASS';
          detail = `${sourceValue} <= ${targetValue}`;
        } else if (operator === 'gte' && sourceNum >= targetNum) {
          status = 'PASS';
          detail = `${sourceValue} >= ${targetValue}`;
        } else {
          detail = `Fuera de rango: ${sourceValue} ${operator} ${targetValue}`;
        }
        break;
      }

      case 'POWER_SUFFICIENT': {
        const required = parseFloat(sourceValue);
        const available = parseFloat(targetValue);
        if (available >= required) {
          status = 'PASS';
          detail = `Potencia suficiente: ${available}W disponible, ${required}W requerido`;
        } else {
          detail = `Potencia insuficiente: ${available}W disponible, ${required}W requerido`;
        }
        break;
      }

      case 'CUSTOM':
        // Futuro: delegación a IA u otro motor
        status = 'SKIPPED';
        detail = 'Regla personalizada - evaluación no implementada';
        break;
    }

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      status,
      sourceProduct,
      targetProduct,
      detail,
    };
  }

  private deduplicateResults(results: CompatibilityCheckResult[]): CompatibilityCheckResult[] {
    const seen = new Set<string>();
    return results.filter((r) => {
      const key = [r.ruleId, r.sourceProduct.id, r.targetProduct.id].sort().join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
