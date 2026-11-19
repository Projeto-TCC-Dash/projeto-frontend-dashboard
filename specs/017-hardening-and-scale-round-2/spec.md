# Feature Specification: Hardening & Cache Sync Round 2 (017)

**Feature Branch**: `017-hardening-and-scale-round-2`  
**Created**: 2026-11-19  
**Status**: Approved  
**Input**: Findings `#1` and `#2` from `/ponytail-review`

## Requirements

- **FR-001**: `useCategorizeTransactions` MUST invalidate `["analysis"]` and `["budgets"]` alongside `["transactions"]` on `onSuccess`.
- **FR-002**: `rawApiFetch` MUST exclude `/api/auth/logout` from `AUTH_EXPIRED_EVENT` dispatch on `401` so expired-token logout does not trigger a duplicate redirect.
