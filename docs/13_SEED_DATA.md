# Seed Data

## Demo user

- Name: Demo Owner
- Email: demo@resttwin.local
- Password: password123 for local dev only

## Demo organization

- Name: Demo Restaurant Group

## Demo restaurant

- Name: Harbor Bistro
- Restaurant type: CASUAL_DINING
- Business model: HYBRID
- Address: Melbourne, FL
- Seating capacity: 48
- Avg table turn: 60 minutes
- Monthly rent: $5,500
- Monthly utilities: $900
- Monthly other fixed costs: $1,800
- Target food cost: 32%
- Target labor cost: 30%

## Operating hours

- Monday: closed
- Tuesday: 11:00-21:00
- Wednesday: 11:00-21:00
- Thursday: 11:00-21:00
- Friday: 11:00-22:00
- Saturday: 11:00-22:00
- Sunday: 12:00-20:00

## Menu items

| Name | Category | Price | Food Cost | Prep Min | Popularity |
|---|---:|---:|---:|---:|---:|
| Chicken Alfredo | Pasta | 16.99 | 5.20 | 12 | 8 |
| Grilled Salmon | Seafood | 24.99 | 9.80 | 16 | 6 |
| Bistro Burger | Sandwich | 15.49 | 4.75 | 10 | 9 |
| Caesar Salad | Salad | 11.99 | 3.10 | 6 | 5 |
| Loaded Fries | Appetizer | 9.99 | 2.25 | 7 | 7 |
| Shrimp Tacos | Seafood | 18.99 | 6.75 | 12 | 7 |
| Kids Chicken Tenders | Kids | 8.99 | 2.60 | 8 | 4 |
| Chocolate Cake | Dessert | 7.99 | 1.80 | 4 | 5 |

## Staff roles

| Role | Wage | Capacity Impact | Productivity |
|---|---:|---|---:|
| Cook | 20.00 | KITCHEN | 1.0 |
| Server | 12.00 | SERVICE | 1.0 |
| Cashier | 14.00 | CASHIER | 0.8 |
| Kitchen Assistant | 16.00 | KITCHEN | 0.7 |

## Weekly shifts

Tuesday-Thursday:

- Cook: 10:00-21:00 quantity 2
- Server: 11:00-21:00 quantity 3
- Cashier: 11:00-21:00 quantity 1

Friday-Saturday:

- Cook: 10:00-22:00 quantity 2
- Kitchen Assistant: 16:00-22:00 quantity 1
- Server: 11:00-22:00 quantity 4
- Cashier: 11:00-22:00 quantity 1

Sunday:

- Cook: 11:00-20:00 quantity 2
- Server: 12:00-20:00 quantity 3
- Cashier: 12:00-20:00 quantity 1

## Demo scenarios

### Scenario 1

Name: Raise prices by 8%
Type: PRICE_CHANGE_PERCENT
Parameters:

```json
{ "percent": 8, "itemIds": [] }
```

### Scenario 2

Name: Add Friday dinner kitchen assistant
Type: STAFFING_CHANGE
Parameters:

```json
{
  "dayOfWeek": 5,
  "startTime": "17:00",
  "endTime": "21:00",
  "roleName": "Kitchen Assistant",
  "quantityDelta": 1
}
```

### Scenario 3

Name: Open Monday dinner only
Type: HOURS_CHANGE
Parameters:

```json
{
  "dayOfWeek": 1,
  "isOpen": true,
  "openTime": "16:00",
  "closeTime": "21:00"
}
```
