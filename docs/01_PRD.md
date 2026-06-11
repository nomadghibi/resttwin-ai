# PRD — RestTwin AI

## Product name

Working name: **RestTwin AI**

## Product category

Agentic AI digital twin and decision intelligence platform for restaurants.

## Problem

Independent restaurants make high-impact decisions with incomplete data. Owners often guess on staffing, menu pricing, opening hours, delivery strategy, inventory, and marketing. Existing restaurant tools mostly report what already happened. They rarely answer what is likely to happen if the owner changes something.

## Vision

Give restaurant owners a virtual AI business team that simulates operations, tests decisions, and recommends actions before real money is spent.

## Core promise

Before making a costly restaurant decision, test it in a digital twin.

## Primary users

1. Independent restaurant owner
2. Small restaurant group operator with 2-10 locations
3. Restaurant consultant
4. New restaurant investor
5. Ghost kitchen operator

## MVP target user

Independent owner/operator of a single casual restaurant.

## MVP jobs to be done

- Set up a restaurant profile quickly.
- Understand baseline restaurant performance.
- Simulate a week of operations.
- Test a decision before applying it.
- Compare expected revenue, labor cost, food cost, wait time, and profit.
- Get a recommendation written in business language.

## Main MVP use cases

### UC1 — Create restaurant digital twin

User enters restaurant type, location, capacity, hours, staff roles, menu items, food costs, prices, and fixed monthly costs.

Output: initial digital twin readiness score and missing data list.

### UC2 — Run baseline simulation

User runs a 7-day simulation using current assumptions.

Output: daily revenue, orders, food cost, labor cost, estimated profit, kitchen load, wait-time risk, and bottlenecks.

### UC3 — Run what-if scenario

User creates a scenario:

- Raise menu prices by percentage
- Add/remove staff by daypart
- Change hours
- Add delivery
- Reduce/remove a menu item
- Add a simple promotion

Output: baseline vs scenario comparison.

### UC4 — Ask decision advisor

User asks: “Should I open on Mondays?” or “Should I raise prices by 8%?”

Output: recommendation, evidence, assumptions, confidence score, and next test.

## MVP non-goals

- Live POS integration
- Automated schedule changes
- Automated menu publishing
- Real competitor scraping
- Real ad campaign execution
- Native mobile app
- Full accounting system
- Inventory purchasing automation
- Franchise multi-location benchmarking

## Product modules

1. Authentication and tenant setup
2. Restaurant profile
3. Menu and cost model
4. Staff and schedule model
5. Simulation engine
6. Scenario builder
7. Agent recommendation engine
8. Dashboard and reports

## Core KPIs shown to user

- Revenue
- Orders
- Average ticket
- Food cost percentage
- Labor cost percentage
- Gross profit
- Estimated net profit
- Kitchen utilization
- Service wait risk
- Break-even status

## Recommendation format

Every recommendation must include:

- Decision: Recommended / Not recommended / Test first / Need more data
- Expected impact
- Main reason
- Main risk
- Assumptions
- Confidence: Low / Medium / High
- Next action

## Trust rules

The app must not pretend estimates are guaranteed. Use phrases like estimated, projected, simulated, likely, or based on current assumptions.

## MVP success criteria

The MVP is successful if a user can run at least three scenarios and clearly understand which option appears better and why.
