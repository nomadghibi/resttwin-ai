import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { LlmProvider } from './llm-provider';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export class AnthropicProvider implements LlmProvider {
  async generateStructured<T>(args: {
    system: string;
    prompt: string;
    schemaName: string;
    schema: z.ZodType<T>;
  }): Promise<T> {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: args.system,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: args.prompt,
        },
      ],
    });

    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error(`AnthropicProvider: no JSON in response for ${args.schemaName}`);

    const parsed = JSON.parse(jsonMatch[0]);
    return args.schema.parse(parsed);
  }
}
