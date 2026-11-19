# Feature Specification: Audit Hardening & Cache Fixes (016)

**Feature Branch**: `016-audit-hardening-fixes`  
**Created**: 2026-11-19  
**Status**: Approved  
**Input**: Findings `#6–#8` (frontend), `#10`, `#11` from `/ponytail-audit`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Server Session Revocation & 401 Recovery (Priority: P1)

As an authenticated user, I need `logout` to revoke my session on the backend and expired/revoked `401` responses to clear my local session and redirect to `/login`.

**Why this priority**: Directly required by Frontend Constitution Principle VIII (Encerramento Seguro de Sessão).

**Independent Test**: Unit tests for `useAuth().logout` calling `POST /api/auth/logout` and `apiRequest` clearing stored auth on `401`.

**Acceptance Scenarios**:
1. **Given** an authenticated user clicks Logout, **When** `logout()` runs, **Then** `POST /api/auth/logout` is called before clearing `localStorage`, clearing TanStack Query cache, and redirecting to `/login`.
2. **Given** a stored token is expired or revoked, **When** any `apiRequest` (other than `/api/auth/login`) returns `401`, **Then** `clearStoredAuth()` is executed and an auth-expired event/redirect to `/login` is triggered.

---

### User Story 2 - Synchronized Cache Invalidation & Lean API Client Reuse (Priority: P2)

As a user editing transactions or updating my financial profile, I need account balances, budgets, and AI analyses to refresh automatically, and export/chat hooks to share the central API client logic.

**Why this priority**: Prevents stale dashboard metrics and duplicated auth/error code.

**Independent Test**: Unit tests for `useUpdateTransaction` and `useUpdateFinancialProfile` invalidating `["analysis"]`, `["accounts"]`, and `["budgets"]`; `useExportTransactions` and `useChatStream` using `rawApiFetch`.

**Acceptance Scenarios**:
1. **Given** a user updates a transaction, **When** `useUpdateTransaction` succeeds, **Then** `["transactions"]`, `["accounts"]`, `["analysis"]`, and `["budgets"]` are invalidated.
2. **Given** a user updates their financial profile, **When** `useUpdateFinancialProfile` succeeds, **Then** `["analysis"]` (not `["financial-analysis"]`) is invalidated.
3. **Given** `types/api.ts` has zero consumers, **When** cleanup runs, **Then** `types/api.ts` is removed.

## Requirements *(mandatory)*

- **FR-001**: `useAuth().logout` MUST call `POST /api/auth/logout` (best-effort) before clearing local auth state.
- **FR-002**: `lib/api-client.ts` MUST clear stored auth and notify/redirect on `401` responses when a token was attached (excluding `/api/auth/login`).
- **FR-003**: `lib/api-client.ts` MUST expose a shared `rawApiFetch` helper reused by `use-export-transactions.ts` and `use-chat-stream.ts`.
- **FR-004**: `useUpdateTransaction` MUST invalidate `["transactions"]`, `["accounts"]`, `["analysis"]`, and `["budgets"]`.
- **FR-005**: `useUpdateFinancialProfile` MUST invalidate `["analysis"]` instead of `["financial-analysis"]`.
- **FR-006**: Unused `types/api.ts` MUST be deleted.
