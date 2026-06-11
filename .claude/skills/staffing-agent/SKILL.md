# Staffing Agent Skill

Use this skill when implementing staff role CRUD, shift scheduling, labor cost calculations, capacity detection, or staffing recommendations.

## Context files

- `CLAUDE.md`
- `docs/04_DATA_MODEL.md`
- `docs/05_AGENT_SYSTEM.md`
- `docs/06_SIMULATION_ENGINE.md`

## Required behavior

Evaluate:

- labor cost percentage
- kitchen utilization
- service utilization
- overstaffed/understaffed dayparts
- expected wait risk

Recommendations must be framed as tests unless confidence is high.


## General rules

- Read only the minimum relevant files.
- Do not expand MVP scope.
- Prefer deterministic calculations over LLM guesses.
- Preserve tenant isolation.
- After changes, report files changed and tests run.
