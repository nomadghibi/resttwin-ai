# Target App File Structure

```text
.
├── CLAUDE.md
├── docs/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── setup/page.tsx
│   │   │   ├── menu/page.tsx
│   │   │   ├── staffing/page.tsx
│   │   │   ├── simulations/page.tsx
│   │   │   ├── scenarios/page.tsx
│   │   │   ├── advisor/page.tsx
│   │   │   └── reports/page.tsx
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── agents/
│   │   ├── agent-types.ts
│   │   ├── orchestrator.ts
│   │   ├── providers/
│   │   │   ├── llm-provider.ts
│   │   │   └── mock-llm-provider.ts
│   │   ├── setup-agent.ts
│   │   ├── simulation-agent.ts
│   │   ├── menu-profit-agent.ts
│   │   ├── staffing-agent.ts
│   │   ├── decision-advisor-agent.ts
│   │   └── tools/
│   ├── components/
│   │   ├── ui/
│   │   ├── app-shell.tsx
│   │   ├── kpi-card.tsx
│   │   ├── recommendation-card.tsx
│   │   ├── agent-activity-panel.tsx
│   │   └── charts/
│   ├── features/
│   │   ├── restaurant/
│   │   ├── menu/
│   │   ├── staffing/
│   │   ├── simulations/
│   │   ├── scenarios/
│   │   └── advisor/
│   ├── lib/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── errors.ts
│   │   ├── money.ts
│   │   └── validation/
│   ├── server/
│   │   ├── repositories/
│   │   └── services/
│   ├── simulation/
│   │   ├── types.ts
│   │   ├── assumptions.ts
│   │   ├── engine.ts
│   │   ├── scenarios.ts
│   │   ├── comparison.ts
│   │   └── __tests__/
│   └── types/
├── tests/
├── package.json
├── tsconfig.json
└── .env.example
```

## Rule

If Claude creates a different structure, it must explain why. Otherwise use this structure.
