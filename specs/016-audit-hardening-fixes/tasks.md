# Tasks: Audit Hardening & Cache Fixes (016)

- [x] T001 SpecKit artifacts created (`spec.md`, `plan.md`, `tasks.md`)
- [x] T002 [P] Add `rawApiFetch` and `401` auth cleanup/event in `lib/api-client.ts`
- [x] T003 [P] Call `POST /api/auth/logout` and handle `401` auth-expired event in `hooks/use-auth.tsx`
- [x] T004 [P] Reuse `rawApiFetch` in `hooks/use-export-transactions.ts` and `hooks/use-chat-stream.ts`
- [x] T005 [P] Fix query invalidations in `hooks/use-update-transaction.ts` and `hooks/use-user-profile.ts`
- [x] T006 [P] Delete unused `types/api.ts`
- [x] T007 Update/add Vitest tests and run `pnpm test -- --run` and `pnpm typecheck`
