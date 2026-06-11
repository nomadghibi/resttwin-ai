import { z } from 'zod';

export interface AgentContext {
  userId: string;
  organizationId: string;
  restaurantId: string;
}

export interface AgentTool<Input = unknown, Output = unknown> {
  name: string;
  description: string;
  inputSchema: z.ZodType<Input>;
  execute(input: Input, ctx: AgentContext): Promise<Output>;
}

export interface AgentResult<T = unknown> {
  agentId: string;
  success: boolean;
  output: T;
  toolsUsed: string[];
  error?: string;
}

export interface AppAgent<Input = unknown, Output = unknown> {
  id: string;
  role: string;
  goal: string;
  run(input: Input, ctx: AgentContext): Promise<AgentResult<Output>>;
}

export const RecommendationSchema = z.object({
  decision: z.enum(['RECOMMENDED', 'NOT_RECOMMENDED', 'TEST_FIRST', 'NEED_MORE_DATA']),
  confidence: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  summary: z.string(),
  expectedImpact: z.object({
    revenueDeltaCents: z.number(),
    profitDeltaCents: z.number(),
    laborCostDeltaCents: z.number(),
    foodCostDeltaCents: z.number(),
    waitRiskDelta: z.number(),
  }),
  evidence: z.array(z.string()),
  assumptions: z.array(z.string()),
  risks: z.array(z.string()),
  nextAction: z.string(),
});

export type RecommendationType = z.infer<typeof RecommendationSchema>;

export interface AgentActivity {
  agent: string;
  finding: string;
}
