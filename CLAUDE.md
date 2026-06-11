# CLAUDE.md — RestTwin AI Coding Rules

## Project identity

Build **RestTwin AI**, an agentic web app for restaurant decision intelligence. The app creates a digital twin of a restaurant, runs operational simulations, compares what-if scenarios, and uses specialized AI agents to explain recommendations.

## MVP outcome

A restaurant owner can:

1. Create an account and restaurant profile.
2. Enter location, restaurant type, hours, seating, fixed costs, menu items, and staff roles.
3. Run a baseline 7-day simulation.
4. Create a what-if scenario such as price increase, staffing change, opening Monday, adding delivery, or removing menu items.
5. Compare baseline vs scenario KPIs.
6. Read an AI-style decision recommendation with confidence score and assumptions.

## Tech stack

Use this exact MVP stack unless the user explicitly changes it:

- Framework: Next.js App Router + TypeScript
- UI: Tailwind CSS + shadcn/ui style components
- Database: PostgreSQL
- ORM: Prisma
- Auth: NextAuth/Auth.js credentials provider for MVP
- Validation: Zod
- Charts: Recharts
- Tests: Vitest for unit tests; Playwright optional after core MVP
- LLM integration: provider adapter interface; mock provider by default; OpenAI/Anthropic env optional later
- Simulation engine: deterministic TypeScript module, no external AI dependency required for core calculations

## Coding constraints

- Do not create a mobile app in MVP.
- Do not build POS integrations in MVP.
- Do not scrape competitors in MVP.
- Do not build real payment/subscription in MVP.
- Do not let agents execute business actions automatically.
- Do not hard-code tenant IDs.
- Do not mix UI, database, and simulation logic in one file.
- Keep every feature tenant-scoped by `organizationId`.
- Prefer simple deterministic business rules over vague LLM logic.
- Any recommendation must include assumptions and confidence.

## Code style

- TypeScript strict mode.
- Zod schemas at boundaries.
- Use server actions or route handlers consistently.
- Keep simulation functions pure where possible.
- Write small files with clear names.
- Add tests for calculations before building UI around them.
- Use seed data to validate end-to-end behavior.

## Token-saving workflow

Before coding, read only the docs needed for the current task. Do not load all docs unless the task spans the whole system.

Recommended context bundles:

- Project skeleton: `CLAUDE.md`, `docs/02_MVP_SCOPE.md`, `docs/03_ARCHITECTURE.md`, `specs/app_file_structure.md`
- Database: `CLAUDE.md`, `docs/04_DATA_MODEL.md`, `docs/10_SECURITY_MULTI_TENANCY.md`
- Simulation: `CLAUDE.md`, `docs/06_SIMULATION_ENGINE.md`, `docs/13_SEED_DATA.md`
- Agents: `CLAUDE.md`, `docs/05_AGENT_SYSTEM.md`, `docs/14_AGENT_PROMPTS.md`
- UI: `CLAUDE.md`, `docs/07_UI_UX_SPEC.md`, `docs/08_API_SPEC.md`
- Testing: `CLAUDE.md`, `docs/12_ACCEPTANCE_TESTS.md`

## Implementation discipline

For each task:

1. Restate the target slice in 3 bullets max.
2. List files to create/edit.
3. Implement the smallest passing version.
4. Run tests/build.
5. Report changed files, test result, and next recommended slice.

## Definition of done

A slice is done only when:

- TypeScript passes.
- Tests pass for touched business logic.
- UI route loads without runtime error.
- Tenant filtering is present on protected data.
- The feature is connected to real schema or clearly marked mock-only.
