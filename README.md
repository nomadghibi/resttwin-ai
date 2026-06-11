# RestTwin AI — Claude Code Documentation Pack

Working name: **RestTwin AI**

Product: **Agentic AI Restaurant Digital Twin & Decision Intelligence Platform**

Purpose: Give Claude Code compact, specific, reusable context so it can build the web MVP without repeatedly loading one huge document.

## How to use this pack with Claude Code

1. Create a new repo.
2. Copy this entire folder into the repo root.
3. Keep `CLAUDE.md` in the repo root.
4. Start Claude Code from the repo root.
5. For each coding session, load only the relevant docs.

Recommended first prompt:

```text
Read CLAUDE.md, docs/01_PRD.md, docs/02_MVP_SCOPE.md, docs/03_ARCHITECTURE.md, and docs/11_IMPLEMENTATION_PLAN.md.
Create the project skeleton exactly as specified. Do not implement advanced features yet. After creating files, run install/build/tests and report only errors and next steps.
```

## Documentation map

| File | Purpose |
|---|---|
| `CLAUDE.md` | Root coding rules and project context for Claude Code |
| `docs/01_PRD.md` | Product requirements document |
| `docs/02_MVP_SCOPE.md` | MVP boundaries and roadmap |
| `docs/03_ARCHITECTURE.md` | Technical architecture and stack decisions |
| `docs/04_DATA_MODEL.md` | Database schema and domain model |
| `docs/05_AGENT_SYSTEM.md` | Agent architecture, tools, workflows |
| `docs/06_SIMULATION_ENGINE.md` | Digital twin simulation rules |
| `docs/07_UI_UX_SPEC.md` | Screens, flows, components |
| `docs/08_API_SPEC.md` | API endpoints and payload contracts |
| `docs/09_CONTEXT_ENGINEERING.md` | Token-saving workflow for Claude Code |
| `docs/10_SECURITY_MULTI_TENANCY.md` | Auth, tenant isolation, safety rules |
| `docs/11_IMPLEMENTATION_PLAN.md` | Build slices in correct order |
| `docs/12_ACCEPTANCE_TESTS.md` | Done criteria and test scenarios |
| `docs/13_SEED_DATA.md` | Sample restaurant data |
| `docs/14_AGENT_PROMPTS.md` | System prompts for app agents |
| `specs/app_file_structure.md` | Target file/folder layout |
| `prompts/claude_session_prompts.md` | Ready-to-use Claude Code prompts |
| `.claude/skills/*/SKILL.md` | Project-specific Claude Code skills |
| `.claude/commands/*.md` | Optional legacy custom slash commands |

## Product one-liner

RestTwin AI creates a digital twin of a restaurant and uses specialized AI agents to simulate operations, test business decisions, and recommend profitable actions before the owner risks real money.

## MVP principle

Build the smallest useful decision platform:

- Restaurant setup
- Menu setup
- Staff setup
- Deterministic simulation
- What-if scenarios
- Agent recommendation summary
- Dashboard with KPIs
- No POS integrations yet
- No autonomous execution yet
