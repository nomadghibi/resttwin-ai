import type { LlmProvider } from './llm-provider';
import { z } from 'zod';

/**
 * Deterministic mock — returns the pre-built object passed via prompt as JSON.
 * Used by default in MVP; swap with OpenAiProvider or AnthropicProvider via env.
 */
export class MockLlmProvider implements LlmProvider {
  async generateStructured<T>(args: {
    prompt: string;
    schema: z.ZodType<T>;
  }): Promise<T> {
    try {
      const parsed = JSON.parse(args.prompt);
      return args.schema.parse(parsed);
    } catch {
      return args.schema.parse({});
    }
  }
}
