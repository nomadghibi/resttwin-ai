# Acceptance Tests

## End-to-end MVP flow

1. User signs in.
2. User creates a restaurant.
3. User adds operating hours.
4. User adds at least 5 menu items.
5. User adds staff roles and shifts.
6. User runs baseline simulation.
7. User creates price increase scenario.
8. User runs scenario.
9. User sees baseline vs scenario comparison.
10. User sees recommendation with confidence and assumptions.

## Simulation calculation tests

### Revenue

Given 10 orders of a $15 item, revenue equals $150.

### Food cost

Given 10 orders with $5 food cost each, food cost equals $50.

### Gross profit

Given $150 revenue and $50 food cost, gross profit equals $100.

### Labor cost

Given 2 cooks at $20/hour for 5 hours, labor cost equals $200.

### Fixed cost allocation

Given monthly fixed cost $13,000, weekly fixed cost approximately $3,000.

### Closed day

If restaurant is closed Monday, Monday orders and revenue equal zero.

### Delivery scenario

Delivery enabled should increase orders and reduce margin by delivery fee assumption.

### Price scenario

A price increase should increase item price and apply demand elasticity rule.

### Bottleneck

If hourly orders exceed kitchen capacity, bottleneck list includes kitchen bottleneck.

## Agent output tests

Recommendation must include:

- decision
- confidence
- summary
- expectedImpact
- evidence
- assumptions
- risks
- nextAction

Agent must not output guaranteed profit language.

## UI acceptance

- Dashboard loads with seed data.
- Empty menu page asks user to add menu items.
- Scenario builder prevents running without baseline or required data.
- KPI deltas use clear positive/negative labels.
- Recommendation card shows confidence badge.

## Security tests

- User cannot access restaurant from another organization.
- API validates invalid negative prices/wages.
- Unauthenticated user is redirected from dashboard.
