# Context Engineering for Claude Code

## Goal

Reduce wasted Claude tokens by keeping context modular, task-specific, and repeatable.

## Core rule

Do not paste all docs into every Claude Code session. Load only the documents needed for the current slice.

## Session patterns

### Session type A — project setup

Load:

- `CLAUDE.md`
- `docs/02_MVP_SCOPE.md`
- `docs/03_ARCHITECTURE.md`
- `specs/app_file_structure.md`

Prompt:

```text
Create the project skeleton for the MVP. Do not implement full features yet. Set up Next.js, TypeScript, Tailwind, Prisma, basic layout, and placeholder routes. Follow the target file structure. Run build and report errors.
```

### Session type B — database/schema

Load:

- `CLAUDE.md`
- `docs/04_DATA_MODEL.md`
- `docs/10_SECURITY_MULTI_TENANCY.md`

Prompt:

```text
Implement the Prisma schema, seed script, database client, and repository helpers for tenant-scoped access. Add basic tests or validation where practical. Do not build UI in this session.
```

### Session type C — simulation

Load:

- `CLAUDE.md`
- `docs/06_SIMULATION_ENGINE.md`
- `docs/13_SEED_DATA.md`

Prompt:

```text
Implement the deterministic simulation engine as pure TypeScript functions. Add unit tests for revenue, food cost, labor cost, delivery scenario, price scenario, and bottleneck detection. Do not call any LLM.
```

### Session type D — scenario engine

Load:

- `CLAUDE.md`
- `docs/06_SIMULATION_ENGINE.md`
- `docs/08_API_SPEC.md`

Prompt:

```text
Implement scenario creation, scenario transforms, run scenario service, and baseline-vs-scenario comparison. Keep business logic outside route handlers. Add tests for each scenario type.
```

### Session type E — agents

Load:

- `CLAUDE.md`
- `docs/05_AGENT_SYSTEM.md`
- `docs/14_AGENT_PROMPTS.md`

Prompt:

```text
Implement the MVP agent framework with Setup Agent, Simulation Agent, Menu Profit Agent, Staffing Agent, and Decision Advisor Agent. Use MockLlmProvider by default. Agents must return structured JSON and cite simulation numbers.
```

### Session type F — UI

Load:

- `CLAUDE.md`
- `docs/07_UI_UX_SPEC.md`
- `docs/08_API_SPEC.md`

Prompt:

```text
Build the MVP UI routes and components. Use existing services and API contracts. Avoid implementing new business logic in React components. Add loading, empty, and error states.
```

### Session type G — QA hardening

Load:

- `CLAUDE.md`
- `docs/12_ACCEPTANCE_TESTS.md`
- current failing logs only

Prompt:

```text
Run tests/build, fix failures only, and do not refactor unrelated code. Report each failure, root cause, fix, and final test result.
```

## Context-save template

At the end of each coding session, ask Claude to create/update:

```text
docs/SESSION_STATE.md
```

With:

- What changed
- Files changed
- Tests passing/failing
- Known issues
- Next recommended task

Next session should load `CLAUDE.md` + `docs/SESSION_STATE.md` + one task-specific doc.

## Anti-token-waste rules

- Do not paste logs longer than needed. Provide only failing section.
- Do not ask Claude to “review the whole app” unless needed.
- Do not request huge rewrites; request one slice.
- Do not mix UI, DB, simulation, and agents in one prompt.
- Always ask for changed files and tests run.
- Use `/compact` after large debugging sessions.

## Good prompt structure

```text
Goal: [one feature]
Context files: [list]
Constraints: [what not to change]
Acceptance: [how to know done]
Action: implement, run tests, summarize changed files.
```
