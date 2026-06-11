# Agent System Design

## Agent-native product concept

RestTwin AI should feel like a team of AI business agents, not a single generic chatbot. Agents should use tools and structured data. They should not guess silently.

## MVP agents

### 1. Setup Agent

Purpose: guide setup and identify missing data.

Inputs:

- Restaurant profile
- Menu items
- Staff roles
- Operating hours
- Fixed costs

Outputs:

- data quality score
- missing fields
- assumptions created
- readiness status

Tools:

- `getRestaurantProfile`
- `listMenuItems`
- `listStaffShifts`
- `calculateDataQualityScore`

### 2. Simulation Agent

Purpose: run baseline and scenario simulations.

Inputs:

- restaurant ID
- scenario parameters optional

Outputs:

- simulation run
- KPI summary
- bottleneck list

Tools:

- `buildSimulationInputSnapshot`
- `runBaselineSimulation`
- `applyScenarioTransform`
- `runScenarioSimulation`

### 3. Menu Profit Agent

Purpose: analyze menu economics.

Inputs:

- menu items
- simulated demand by item

Outputs:

- item margin classification
- price risk notes
- menu action suggestions

Tools:

- `calculateMenuMargins`
- `classifyMenuItems`
- `estimatePriceChangeImpact`

### 4. Staffing Agent

Purpose: evaluate labor coverage and bottlenecks.

Inputs:

- weekly staff shifts
- simulated demand by hour

Outputs:

- overstaffed/understaffed dayparts
- labor cost percentage
- recommended staffing adjustments

Tools:

- `calculateLaborCost`
- `estimateKitchenCapacity`
- `estimateServiceCapacity`
- `detectStaffingBottlenecks`

### 5. Decision Advisor Agent

Purpose: combine tool results into final business recommendation.

Inputs:

- baseline simulation
- scenario simulation
- comparison deltas
- menu analysis
- staffing analysis
- data quality score

Outputs:

- structured recommendation

Tools:

- `compareSimulationRuns`
- `scoreScenarioRisk`
- `generateRecommendation`

## Future agents

- Location Intelligence Agent
- Competitor Intelligence Agent
- Inventory and Waste Agent
- Marketing Campaign Agent
- Financial CFO Agent
- Risk Monitoring Agent
- Report Agent

## Agent orchestration flow

For MVP scenario advice:

```text
Decision Advisor Agent
  -> asks Simulation Agent for baseline/scenario comparison
  -> asks Menu Profit Agent for menu impact
  -> asks Staffing Agent for labor impact
  -> calculates risk and confidence
  -> returns recommendation JSON
```

## Agent result schema

```ts
const RecommendationSchema = z.object({
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
```

## Guardrails

- Agents recommend; they do not execute real-world actions.
- Agents must cite simulation numbers from tool outputs.
- Agents must state assumptions.
- Agents must use low confidence when data quality is poor.
- Agents must avoid legal, tax, or guaranteed profit claims.

## Agent UI pattern

Show an **Agent Activity Panel**:

- Setup Agent: checked data quality
- Simulation Agent: ran 7-day model
- Menu Profit Agent: found 3 low-margin items
- Staffing Agent: found Friday dinner bottleneck
- Decision Advisor: produced recommendation

This makes the platform feel agentic without needing a complex autonomous backend in MVP.
