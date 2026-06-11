# UI / UX Spec

## UX principle

Restaurant owners need fast, clear decisions. Avoid complex analytics jargon on main screens. Put details behind drill-downs.

## App navigation

- Dashboard
- Restaurant Setup
- Menu
- Staffing
- Simulations
- Scenarios
- AI Advisor
- Reports
- Settings

## Screens

### 1. Landing page

Goal: explain product and drive demo/signup.

Sections:

- Hero: “Test restaurant decisions before you risk real money.”
- Three value cards: Simulate operations, optimize profit, get AI recommendations.
- Use-case examples: raise prices, open Monday, add delivery, adjust staffing.
- CTA: Start demo / Create account.

### 2. Onboarding wizard

Steps:

1. Restaurant basics
2. Hours and capacity
3. Fixed costs
4. Menu items
5. Staff roles and schedule
6. Review digital twin readiness

### 3. Dashboard

Components:

- KPI cards: Revenue, Orders, Food Cost %, Labor Cost %, Est. Profit, Wait Risk
- Weekly revenue chart
- Profit breakdown chart
- Bottleneck warnings
- Latest recommendation card
- Scenario quick-start buttons

### 4. Restaurant setup

Editable forms for:

- Basic info
- Location text
- Restaurant type
- Business model
- Capacity
- Fixed costs
- Operating hours

### 5. Menu page

Table columns:

- Item
- Category
- Price
- Food cost
- Gross margin
- Prep minutes
- Popularity weight
- Active status

Actions:

- Add item
- Edit item
- Deactivate item

### 6. Staffing page

Views:

- Staff roles table
- Weekly schedule grid

Role fields:

- Name
- Hourly wage
- Capacity impact
- Productivity

Shift fields:

- Day
- Start
- End
- Quantity

### 7. Simulations page

Shows baseline runs.

Actions:

- Run baseline simulation
- View details
- Duplicate into scenario

### 8. Scenario builder

Scenario templates:

- Raise prices
- Change staffing
- Change hours
- Add delivery
- Run promotion

After user configures scenario:

- Button: Run scenario
- Result: baseline vs scenario comparison

### 9. AI Advisor page

Chat-like interface plus structured recommendation cards.

Example questions:

- Should I open on Mondays?
- Should I raise prices by 8%?
- Am I overstaffed during lunch?
- Which menu items should I promote?

MVP can map questions to scenario templates or show “create a scenario first.”

### 10. Report page

Printable report:

- Restaurant profile summary
- Scenario name
- Baseline KPIs
- Scenario KPIs
- Recommendation
- Assumptions
- Risks
- Next action

## Component list

- `KpiCard`
- `DeltaBadge`
- `ConfidenceBadge`
- `DecisionBadge`
- `AssumptionList`
- `RiskList`
- `ScenarioTemplateCard`
- `SimulationChart`
- `BottleneckAlert`
- `AgentActivityPanel`
- `RecommendationCard`

## Empty states

When no data:

- Dashboard: “Finish setup to run your first simulation.”
- Menu: “Add at least 5 menu items for a useful simulation.”
- Staffing: “Add staff roles and shifts to estimate labor cost.”
- Scenario: “Run a baseline simulation first.”

## Tone

Use clear owner-friendly language:

- “Estimated profit” not “net income forecast certainty”
- “Wait risk” not “queueing model variance”
- “Test first” not “inconclusive recommendation”
