# Security Review Skill

Use this skill when touching auth, route handlers, tenant-scoped data, recommendations, or LLM provider code.

## Context files

- `CLAUDE.md`
- `docs/10_SECURITY_MULTI_TENANCY.md`

## Checklist

- Authentication required for protected routes.
- Membership verified before data access.
- Queries are organization-scoped.
- Secrets are not sent to LLM.
- Agents cannot perform real-world actions.
- Inputs validated with Zod.
- Errors do not leak secrets.
