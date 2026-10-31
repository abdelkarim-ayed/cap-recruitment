import type { ProcessingDefinition } from '@recruitment/domain/vacancies';
import type { TaskResult } from './execution.js';

// Bounded, code-owned capabilities, not user-defined conditions or a DAG engine.
export const taskRegistry = {
  extractSkills: {
    sourceType: 'document',
    preparation: 'text',
    validateResult(result: TaskResult, args: ProcessingDefinition['tasks'][number]['args']) {
      if (result.status !== 'completed') return;
      if (new Set(result.value.skills).size !== result.value.skills.length || result.value.skills.some(skill => !args.skills.includes(skill))) throw new Error('Extractor returned duplicate or unconfigured skills.');
      if (!args.evidence && result.evidence.length) throw new Error('Extractor returned evidence when disabled.');
    },
  },
} as const;
