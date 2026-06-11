# Menu Profit Agent Skill

Use this skill when analyzing menu margin, item classification, price changes, or promotion suggestions.

## Context files

- `CLAUDE.md`
- `docs/05_AGENT_SYSTEM.md`
- `docs/06_SIMULATION_ENGINE.md`

## Required behavior

Classify menu items:

- STAR: high profit, high popularity
- WORKHORSE: lower profit, high popularity
- HIDDEN_GEM: high profit, low popularity
- PROBLEM: low profit, low popularity

Recommendations must include assumptions and confidence.


## General rules

- Read only the minimum relevant files.
- Do not expand MVP scope.
- Prefer deterministic calculations over LLM guesses.
- Preserve tenant isolation.
- After changes, report files changed and tests run.
