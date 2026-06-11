# Decision Advisor Agent Skill

Use this skill when implementing final recommendation generation, advisor question answering, recommendation cards, or report summaries.

## Context files

- `CLAUDE.md`
- `docs/05_AGENT_SYSTEM.md`
- `docs/14_AGENT_PROMPTS.md`
- `docs/12_ACCEPTANCE_TESTS.md`

## Required output

The recommendation must include:

- decision
- confidence
- summary
- expectedImpact
- evidence
- assumptions
- risks
- nextAction

Never use guaranteed-profit wording.


## General rules

- Read only the minimum relevant files.
- Do not expand MVP scope.
- Prefer deterministic calculations over LLM guesses.
- Preserve tenant isolation.
- After changes, report files changed and tests run.
