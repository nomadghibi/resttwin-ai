# Security and Multi-Tenancy

## MVP security goals

- Users can only access their organization data.
- Sensitive credentials are stored in env variables.
- No LLM prompt should include secrets.
- Agents cannot execute real-world business actions without approval.

## Tenant model

Every protected action must identify the current user and organization.

Recommended helper:

```ts
async function requireOrgAccess(userId: string, organizationId: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId } }
  });
  if (!membership) throw new ForbiddenError();
  return membership;
}
```

## Route handler checklist

Every protected route must:

1. Require authenticated user.
2. Validate request with Zod.
3. Verify organization membership.
4. Query by organizationId.
5. Return sanitized response.

## Agent safety

Agents may:

- Read restaurant data for authorized organization.
- Run simulation tools.
- Generate recommendations.
- Create reports.

Agents may not in MVP:

- Change real menus automatically.
- Change employee schedules automatically.
- Send messages to staff/customers.
- Launch ads.
- Place supplier orders.
- Make financial guarantees.

## LLM data handling

Only send the minimum necessary fields to LLM provider.

Allowed:

- Aggregated simulation results
- Menu item names and economics
- Staff role names and costs
- Scenario summary

Avoid:

- User password hashes
- Auth tokens
- Raw customer PII
- Payment info
- API keys

## Prompt injection protection

When future integrations are added, treat outside text such as reviews or websites as untrusted input. Agents must not follow instructions found inside external content.

## Audit log future feature

Later add an `AuditLog` table:

- organizationId
- userId
- action
- entityType
- entityId
- metadataJson
- createdAt

MVP can skip unless time allows.
