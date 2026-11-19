# Implementation Plan: Audit Hardening & Cache Fixes (016)

**Branch**: `016-audit-hardening-fixes` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

## Summary

Implement Frontend audit fixes `#6`, `#7`, `#8` (frontend), `#10`, and `#11` in compliance with the Frontend Constitution (strict TS, zero `any`, TanStack Query invalidation, Principle VIII logout revocation, Vitest + Testing Library).

## Constitution Check

- **Principle I (Strict TS, zero `any`)**: Compliant.
- **Principle V (TanStack Query)**: Restores missing invalidations for `["analysis"]`, `["accounts"]`, `["budgets"]`.
- **Principle VIII (Session Security)**: Restores server-side `POST /api/auth/logout` revocation on logout and `401` cleanup.

## Project Structure (Touched Files)

- `lib/api-client.ts` — add `rawApiFetch` helper + `401` auth cleanup/event
- `hooks/use-auth.tsx` — call `POST /api/auth/logout` in `logout()` + listen for `401` auth-expired event
- `hooks/use-export-transactions.ts` — reuse `rawApiFetch`
- `hooks/use-chat-stream.ts` — reuse `rawApiFetch`
- `hooks/use-update-transaction.ts` — invalidate `["accounts"]`, `["analysis"]`, `["budgets"]`
- `hooks/use-user-profile.ts` — fix `["financial-analysis"]` -> `["analysis"]`
- `types/api.ts` — delete unused re-export
- `lib/api-client.test.ts`, `hooks/use-auth.test.tsx`, `hooks/use-update-transaction.test.tsx`, `hooks/use-user-profile.test.tsx` — regression tests
