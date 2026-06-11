# Implementation Plan

## Build slice 1 — Project foundation

Deliverables:

- Next.js app
- TypeScript strict mode
- Tailwind
- Basic app layout
- Auth placeholder or Auth.js setup
- Prisma setup
- Environment example
- Basic dashboard placeholder

Acceptance:

- `npm run build` passes
- App opens locally
- Routes exist for dashboard/setup/menu/staffing/scenarios/advisor

## Build slice 2 — Prisma schema and seed

Deliverables:

- Prisma models from data model doc
- Seed demo organization/user/restaurant/menu/staff/hours
- Prisma client helper

Acceptance:

- Migration runs
- Seed creates demo data
- Tenant relations work

## Build slice 3 — Restaurant setup CRUD

Deliverables:

- Restaurant profile form
- Operating hours editor
- Fixed costs fields
- Server-side validation

Acceptance:

- User can create/edit restaurant
- Invalid values show errors
- Data persists

## Build slice 4 — Menu CRUD

Deliverables:

- Menu item table
- Add/edit/deactivate item
- Margin calculation display

Acceptance:

- CRUD works
- Gross margin shown correctly

## Build slice 5 — Staff CRUD and schedule

Deliverables:

- Staff roles
- Weekly staff shifts
- Wage/productivity fields

Acceptance:

- Staff role and shifts persist
- Weekly schedule visible

## Build slice 6 — Simulation engine

Deliverables:

- Pure TypeScript engine
- Build input snapshot from restaurant data
- Baseline simulation service
- Unit tests

Acceptance:

- Baseline simulation produces totals
- Tests pass for calculations

## Build slice 7 — Scenario engine

Deliverables:

- Scenario creation
- Scenario transforms
- Scenario simulation run
- Comparison deltas

Acceptance:

- All five MVP scenario types work
- Scenario comparison saved

## Build slice 8 — Agent framework

Deliverables:

- Agent interfaces
- Tool interfaces
- MockLlmProvider
- Setup Agent
- Simulation Agent
- Menu Profit Agent
- Staffing Agent
- Decision Advisor Agent

Acceptance:

- Scenario run produces structured recommendation
- Recommendation includes decision, confidence, evidence, assumptions, risks, next action

## Build slice 9 — Dashboard and charts

Deliverables:

- KPI cards
- Weekly chart
- Profit breakdown
- Bottleneck alerts
- Recommendation card

Acceptance:

- Dashboard shows latest baseline/scenario results
- Empty states guide user

## Build slice 10 — Reports and polish

Deliverables:

- Printable scenario report
- Demo data reset button optional
- Better loading/error states

Acceptance:

- User can print/save a report from browser
- Core workflow is smooth

## Suggested first Claude Code command

```text
Read CLAUDE.md, docs/02_MVP_SCOPE.md, docs/03_ARCHITECTURE.md, docs/11_IMPLEMENTATION_PLAN.md, and specs/app_file_structure.md. Implement Build slice 1 only. Do not implement simulation or agents yet. Run build and summarize changed files.
```
