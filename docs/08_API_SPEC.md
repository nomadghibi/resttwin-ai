# API Spec

## Style

Use Next.js route handlers or server actions. Validate input with Zod. Return JSON with consistent error shape.

## Error shape

```ts
{
  error: {
    code: string;
    message: string;
    details?: unknown;
  }
}
```

## Endpoints

### Auth

MVP can use Auth.js routes. If custom endpoints are used:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`

### Restaurant

#### GET `/api/restaurants/current`

Returns current organization restaurant.

#### POST `/api/restaurants`

Create restaurant.

Body:

```json
{
  "name": "Demo Bistro",
  "restaurantType": "CASUAL_DINING",
  "addressText": "Melbourne, FL",
  "businessModel": "HYBRID",
  "seatingCapacity": 50,
  "avgTableTurnMinutes": 60,
  "monthlyRent": 500000,
  "monthlyUtilities": 90000,
  "monthlyOtherFixedCosts": 160000
}
```

#### PATCH `/api/restaurants/:id`

Update restaurant.

### Operating hours

- `GET /api/restaurants/:id/hours`
- `PUT /api/restaurants/:id/hours`

### Menu

- `GET /api/restaurants/:id/menu-items`
- `POST /api/restaurants/:id/menu-items`
- `PATCH /api/menu-items/:id`
- `DELETE /api/menu-items/:id`

Menu item body:

```json
{
  "name": "Chicken Alfredo",
  "category": "Pasta",
  "priceCents": 1699,
  "foodCostCents": 520,
  "prepMinutes": 12,
  "popularityWeight": 8,
  "isActive": true
}
```

### Staff

- `GET /api/restaurants/:id/staff-roles`
- `POST /api/restaurants/:id/staff-roles`
- `PATCH /api/staff-roles/:id`
- `DELETE /api/staff-roles/:id`
- `GET /api/restaurants/:id/staff-shifts`
- `POST /api/restaurants/:id/staff-shifts`
- `PATCH /api/staff-shifts/:id`
- `DELETE /api/staff-shifts/:id`

### Simulations

#### POST `/api/restaurants/:id/simulations/baseline`

Runs baseline simulation and saves result.

Returns:

```json
{
  "simulationRunId": "...",
  "totals": {},
  "bottlenecks": [],
  "assumptions": []
}
```

#### GET `/api/restaurants/:id/simulations`

List simulation runs.

### Scenarios

#### POST `/api/restaurants/:id/scenarios`

Create scenario.

Example:

```json
{
  "name": "Raise dinner prices by 8%",
  "type": "PRICE_CHANGE_PERCENT",
  "parameters": {
    "percent": 8,
    "itemIds": []
  }
}
```

#### POST `/api/scenarios/:id/run`

Runs scenario, compares to baseline, and creates recommendation.

Returns:

```json
{
  "scenarioId": "...",
  "baseline": {},
  "scenario": {},
  "comparison": {},
  "recommendation": {}
}
```

#### GET `/api/scenarios/:id`

Scenario detail.

### Advisor

#### POST `/api/advisor/ask`

MVP maps questions to existing scenario and recommendation context.

Body:

```json
{
  "restaurantId": "...",
  "question": "Should I open on Mondays?"
}
```

Return:

```json
{
  "answer": "Test Monday dinner only for four weeks...",
  "recommendationId": "...",
  "needsScenario": false
}
```

## Authorization rule

Every endpoint must verify user membership in the organization that owns the restaurant/scenario.
