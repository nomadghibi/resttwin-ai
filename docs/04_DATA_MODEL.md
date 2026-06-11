# Data Model

## Tenant model

Every business record belongs to an `Organization`.

```text
User -> Membership -> Organization -> Restaurant
```

## Entities

### User

- id
- name
- email
- passwordHash
- createdAt

### Organization

- id
- name
- createdAt

### Membership

- id
- userId
- organizationId
- role: OWNER | ADMIN | VIEWER

### Restaurant

- id
- organizationId
- name
- restaurantType
- addressText
- city
- state
- postalCode
- country
- businessModel: DINE_IN | TAKEOUT | DELIVERY | HYBRID
- seatingCapacity
- avgTableTurnMinutes
- monthlyRent
- monthlyUtilities
- monthlyOtherFixedCosts
- targetFoodCostPercent
- targetLaborCostPercent
- createdAt
- updatedAt

### OperatingHour

- id
- restaurantId
- dayOfWeek: 0-6
- isOpen
- openTime: HH:mm
- closeTime: HH:mm

### MenuItem

- id
- restaurantId
- name
- category
- priceCents
- foodCostCents
- prepMinutes
- popularityWeight
- isActive

### StaffRole

- id
- restaurantId
- name
- hourlyWageCents
- capacityImpact: KITCHEN | SERVICE | CASHIER | DELIVERY
- defaultProductivity

### StaffShift

- id
- restaurantId
- staffRoleId
- dayOfWeek
- startTime
- endTime
- quantity

### SimulationRun

- id
- restaurantId
- organizationId
- type: BASELINE | SCENARIO
- scenarioId nullable
- status: PENDING | COMPLETED | FAILED
- inputSnapshotJson
- resultJson
- createdAt

### Scenario

- id
- restaurantId
- organizationId
- name
- type
- parametersJson
- baselineRunId nullable
- scenarioRunId nullable
- createdAt

### Recommendation

- id
- scenarioId
- organizationId
- decision: RECOMMENDED | NOT_RECOMMENDED | TEST_FIRST | NEED_MORE_DATA
- confidence: LOW | MEDIUM | HIGH
- summary
- expectedImpactJson
- evidenceJson
- assumptionsJson
- risksJson
- nextAction
- createdAt

## Suggested Prisma enum values

```prisma
enum MembershipRole {
  OWNER
  ADMIN
  VIEWER
}

enum BusinessModel {
  DINE_IN
  TAKEOUT
  DELIVERY
  HYBRID
}

enum SimulationType {
  BASELINE
  SCENARIO
}

enum ScenarioType {
  PRICE_CHANGE_PERCENT
  STAFFING_CHANGE
  HOURS_CHANGE
  DELIVERY_TOGGLE
  PROMOTION
}

enum DecisionType {
  RECOMMENDED
  NOT_RECOMMENDED
  TEST_FIRST
  NEED_MORE_DATA
}

enum ConfidenceLevel {
  LOW
  MEDIUM
  HIGH
}
```

## Important indexes

- Organization by id
- Membership by userId + organizationId
- Restaurant by organizationId
- MenuItem by restaurantId
- StaffShift by restaurantId and dayOfWeek
- Scenario by organizationId and restaurantId
- SimulationRun by organizationId and restaurantId

## Tenant safety rule

Every query for restaurant data must filter by `organizationId` or verify membership before returning data.
