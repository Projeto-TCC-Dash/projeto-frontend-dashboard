# Implementation Plan: Hardening & Cache Sync Round 2 (017)

**Branch**: `017-hardening-and-scale-round-2` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

## Project Structure (Touched Files)

- `hooks/use-categorize-transactions.ts` — invalidate `["analysis"]` and `["budgets"]`
- `lib/api-client.ts` — exclude `/api/auth/logout` from `AUTH_EXPIRED_EVENT`
- `hooks/use-categorize-transactions.test.tsx`, `lib/api-client.test.ts` — unit tests
