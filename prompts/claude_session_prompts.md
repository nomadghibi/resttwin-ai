# Claude Code Session Prompts

## 1. Start project skeleton

```text
Read CLAUDE.md, docs/02_MVP_SCOPE.md, docs/03_ARCHITECTURE.md, docs/11_IMPLEMENTATION_PLAN.md, and specs/app_file_structure.md.

Goal: implement Build slice 1 only.

Create the Next.js TypeScript project structure, Tailwind setup, app shell, placeholder routes, environment example, and basic package scripts. Do not implement database models, simulation, or agents yet.

Acceptance:
- npm install works
- npm run build works or report exact blockers
- routes exist for dashboard, setup, menu, staffing, simulations, scenarios, advisor, reports
- summarize changed files
```

## 2. Build database schema

```text
Read CLAUDE.md, docs/04_DATA_MODEL.md, docs/10_SECURITY_MULTI_TENANCY.md, and docs/13_SEED_DATA.md.

Goal: implement Prisma schema and seed data.

Create the Prisma models, enums, relations, seed script, db client, and basic repository helpers. Keep all protected records organization-scoped.

Acceptance:
- migration can run
- seed creates Demo Owner, Demo Restaurant Group, Harbor Bistro, menu, hours, staff roles, shifts, and scenarios
- no UI work
- summarize changed files and commands run
```

## 3. Build simulation engine

```text
Read CLAUDE.md, docs/06_SIMULATION_ENGINE.md, docs/13_SEED_DATA.md.

Goal: implement deterministic simulation engine.

Create pure TypeScript simulation functions with unit tests for revenue, food cost, labor cost, fixed cost allocation, price scenario, delivery scenario, closed day, and bottleneck detection. Do not use any LLM or database in the pure engine.

Acceptance:
- npm test passes for simulation tests
- functions are typed
- assumptions are centralized in src/simulation/assumptions.ts
- summarize changed files
```

## 4. Build scenario services and API

```text
Read CLAUDE.md, docs/06_SIMULATION_ENGINE.md, docs/08_API_SPEC.md, docs/04_DATA_MODEL.md.

Goal: implement baseline simulation and scenario execution services.

Add services and API routes/server actions to run baseline simulation, create scenarios, apply scenario transforms, run scenario simulation, compare results, and save SimulationRun records.

Acceptance:
- all five MVP scenario types are supported
- route handlers validate with Zod
- business logic is not inside React components
- tenant membership is checked
- tests cover scenario transforms
```

## 5. Build agent layer

```text
Read CLAUDE.md, docs/05_AGENT_SYSTEM.md, docs/14_AGENT_PROMPTS.md.

Goal: implement MVP agent framework.

Create agent types, tools, orchestrator, MockLlmProvider, Setup Agent, Simulation Agent, Menu Profit Agent, Staffing Agent, and Decision Advisor Agent. Decision Advisor must return structured recommendation JSON.

Acceptance:
- scenario run can produce Recommendation data
- recommendation includes decision, confidence, evidence, assumptions, risks, nextAction
- no real LLM key is required for local dev
- tests validate output shape
```

## 6. Build dashboard UI

```text
Read CLAUDE.md, docs/07_UI_UX_SPEC.md, docs/08_API_SPEC.md.

Goal: build the UI around existing services.

Implement dashboard, setup, menu, staffing, scenario builder, advisor, and report pages using existing services. Do not duplicate simulation logic in UI.

Acceptance:
- seed demo data displays
- user can run baseline and scenario from UI
- KPI cards and recommendation card render
- empty/error/loading states exist
- build passes
```

## 7. QA hardening

```text
Read CLAUDE.md and docs/12_ACCEPTANCE_TESTS.md.

Goal: harden the app without changing scope.

Run lint/build/tests. Fix only failures and obvious MVP bugs. Do not add new features. Then manually verify the full MVP flow from login to scenario recommendation.

Report:
- failures found
- root causes
- files changed
- final test/build status
- remaining known issues
```
