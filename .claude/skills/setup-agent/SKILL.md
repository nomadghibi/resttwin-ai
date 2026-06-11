# Setup Agent Skill

Use this skill when implementing or modifying restaurant onboarding, restaurant profile completeness, data quality score, missing data detection, or setup readiness.

## Context files

- `CLAUDE.md`
- `docs/01_PRD.md`
- `docs/04_DATA_MODEL.md`
- `docs/05_AGENT_SYSTEM.md`
- `docs/07_UI_UX_SPEC.md`

## Required behavior

The Setup Agent evaluates:

- restaurant profile completeness
- operating hours completeness
- menu item count and required fields
- staff role and staff shift completeness
- fixed cost completeness
- capacity fields

Return:

- readiness: READY | PARTIAL | NOT_READY
- dataQualityScore: 0-100
- missingFields: string[]
- assumptions: string[]
- nextSteps: string[]


## General rules

- Read only the minimum relevant files.
- Do not expand MVP scope.
- Prefer deterministic calculations over LLM guesses.
- Preserve tenant isolation.
- After changes, report files changed and tests run.
