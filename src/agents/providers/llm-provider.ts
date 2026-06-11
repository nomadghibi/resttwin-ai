import { z } from 'zod';

export interface LlmProvider {
  generateStructured<T>(args: {
    system: string;
    prompt: string;
    schemaName: string;
    schema: z.ZodType<T>;
  }): Promise<T>;
}
