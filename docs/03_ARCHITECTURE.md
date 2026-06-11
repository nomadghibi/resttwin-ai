# Technical Architecture

## Architecture style

Full-stack Next.js MVP with a deterministic simulation engine and an agent orchestration layer.

## Core decision

Do not rely on LLMs for math. Use deterministic TypeScript functions for calculations. Use AI agents for orchestration, explanation, recommendation framing, and scenario reasoning.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style components
- PostgreSQL
- Prisma ORM
- Zod validation
- Recharts
- Vitest
- NextAuth/Auth.js credentials provider for MVP

## System layers

```text
Web UI
  -> Server actions / API routes
    -> Domain services
      -> Prisma repositories
      -> Simulation engine
      -> Agent orchestrator
        -> Agent tools
        -> LLM provider adapter or mock provider
```

## Important directories

```text
src/app                 App Router pages
src/components          Shared UI components
src/features            Feature modules
src/lib/db              Prisma client
src/lib/auth            Auth utilities
src/lib/validation      Zod schemas
src/server/services     Business services
src/server/repositories Database access
src/simulation          Pure digital twin engine
src/agents              Agent framework and specialized agents
src/agents/tools        Tool functions agents can call
src/types               Shared types
prisma                  Schema and seed
```

## Domain modules

### Restaurant module

Manages profile, location text, business model, hours, capacity, fixed costs.

### Menu module

Manages menu items, price, food cost, prep time, category, popularity estimate.

### Staffing module

Manages roles, hourly cost, weekly shifts, capacity impact.

### Simulation module

Runs baseline and scenario simulations.

### Scenario module

Stores scenario inputs and comparison results.

### Agent module

Turns scenario results into recommendations with structured output.

## Agent architecture

Use a lightweight in-app agent framework:

```ts
interface AgentTool<Input, Output> {
  name: string;
  description: string;
  inputSchema: z.ZodType<Input>;
  execute(input: Input, ctx: AgentContext): Promise<Output>;
}

interface AppAgent {
  id: string;
  role: string;
  goal: string;
  tools: AgentTool<any, any>[];
  run(input: unknown, ctx: AgentContext): Promise<AgentResult>;
}
```

For MVP, implement agents as deterministic services plus optional LLM summarization.

## LLM provider adapter

Create this interface even if using a mock first:

```ts
interface LlmProvider {
  generateStructured<T>(args: {
    system: string;
    prompt: string;
    schemaName: string;
    schema: z.ZodType<T>;
  }): Promise<T>;
}
```

Providers:

- `MockLlmProvider` for local development and tests
- `OpenAiProvider` later
- `AnthropicProvider` later

## Data flow for scenario recommendation

```text
User creates scenario
  -> scenario service validates input
  -> simulation engine creates baseline result if needed
  -> simulation engine applies scenario transform
  -> comparison service computes deltas
  -> decision advisor agent calls tools
  -> recommendation JSON saved
  -> dashboard renders KPIs, charts, recommendation
```

## Reliability rules

- All simulation inputs must be validated by Zod.
- Never store LLM free text as the only source of decision logic.
- Store structured recommendation fields.
- Tests must cover revenue, cost, labor, margin, and scenario deltas.
