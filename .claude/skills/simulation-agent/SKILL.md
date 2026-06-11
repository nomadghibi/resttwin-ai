# Simulation Agent Skill

Use this skill when implementing baseline simulation, scenario simulation, scenario transforms, or simulation tests.

## Context files

- `CLAUDE.md`
- `docs/06_SIMULATION_ENGINE.md`
- `docs/13_SEED_DATA.md`

## Required behavior

- Keep engine functions pure.
- Use centralized assumptions.
- Test math before building UI.
- No LLM calls inside simulation engine.
- Return structured totals, byDay, byHour, menuItemResults, bottlenecks, and assumptions.


## General rules

- Read only the minimum relevant files.
- Do not expand MVP scope.
- Prefer deterministic calculations over LLM guesses.
- Preserve tenant isolation.
- After changes, report files changed and tests run.
