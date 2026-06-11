import type { LlmProvider } from './llm-provider';
import { MockLlmProvider } from './mock-llm-provider';
import { AnthropicProvider } from './anthropic-provider';

let _provider: LlmProvider | null = null;

export function getLlmProvider(): LlmProvider {
  if (_provider) return _provider;
  _provider = process.env.ANTHROPIC_API_KEY
    ? new AnthropicProvider()
    : new MockLlmProvider();
  return _provider;
}
