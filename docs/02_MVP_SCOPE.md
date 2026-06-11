# MVP Scope and Roadmap

## MVP version

`v0.1 Agentic Digital Twin MVP`

## MVP feature list

### Must have

- User registration/login
- Organization/tenant creation
- Restaurant profile form
- Location field as plain address/ZIP/city text
- Restaurant type selector
- Operating hours editor
- Seating/capacity input
- Fixed monthly costs input
- Menu item CRUD
- Staff role CRUD
- Simple weekly staffing plan
- Baseline simulation
- Scenario builder
- Baseline vs scenario dashboard
- Agent recommendation summary
- Seed demo restaurant

### Should have

- Scenario templates
- Export simple PDF/print report
- Confidence score and assumptions
- Data quality score
- Demo mode without sign-up

### Could have later

- Google Maps/local demographic data
- Competitor intelligence
- POS integrations
- QuickBooks integration
- Real weather/event impact
- Inventory ordering
- Multi-location benchmarking
- Native mobile app

## MVP scenario types

Only implement these scenario types first:

1. `PRICE_CHANGE_PERCENT`
   - Apply percentage price change to all menu items or selected items.
2. `STAFFING_CHANGE`
   - Add/remove one staff role for selected dayparts.
3. `HOURS_CHANGE`
   - Open/close a day or adjust open/close time.
4. `DELIVERY_TOGGLE`
   - Simulate delivery demand increase and margin reduction.
5. `PROMOTION`
   - Increase demand by percentage and optionally reduce average price.

## Recommended build phases

### Phase 0 — Repo foundation

- Next.js app
- Tailwind
- Prisma
- Auth
- Basic layout
- Database seed

### Phase 1 — Restaurant setup

- Restaurant profile
- Menu items
- Staff roles
- Weekly schedule

### Phase 2 — Simulation engine

- Pure TypeScript simulation functions
- Unit tests
- Baseline simulation storage

### Phase 3 — Scenario engine

- Scenario CRUD
- Scenario transforms
- Baseline vs scenario comparison

### Phase 4 — Agent recommendation layer

- Agent orchestrator
- Mock LLM provider
- Deterministic tool calls
- Recommendation cards

### Phase 5 — Dashboard polish

- KPI cards
- Charts
- Bottleneck warnings
- Print/export report

## Cut line

If time is limited, do not build integrations. Make the simulation and recommendation workflow excellent first.
