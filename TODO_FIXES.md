# QA Remediation TODO (Phase-based)

## Phase 0 — Security Emergency
- [x] Remove hardcoded NanoGPT key from test script (`test-api.js`)
- [ ] Rotate exposed NanoGPT key (manual action required)
- [ ] Purge leaked key from Git history (manual: `git filter-repo` or BFG)

## Phase 1 — API Hardening
- [x] Add strict JSON payload parsing and 400 on malformed payload
- [x] Add plan-task validation (`deadline`, `dailyHours` 1..12)
- [x] Add invalid date detection and proper error messages
- [x] Add lightweight per-IP rate limiting (best-effort in worker memory)
- [x] Replace wildcard CORS with allowlist strategy (`ALLOWED_ORIGINS` + fallback)
- [ ] Add durable rate-limiting with KV/Durable Object (next iteration)
- [ ] Add request auth token for server-side protection (optional hardening)

## Phase 2 — Frontend Correctness & UX
- [x] Fix session naming monotonic counter (`sessionCounter`) to stop Session 1/2 confusion
- [x] Fix `resetUI()` overriding active session name incorrectly
- [x] Stabilize delete-session flow when deleting active/last session
- [x] Disable main delete button when only one session remains
- [x] Add real voice recording support via `MediaRecorder`
- [x] Persist voice feedback in session storage

## Phase 3 — Quiz/Mindmap Integrity & Safety
- [x] Fix quiz grading to use `q.correct` from API instead of fixed index
- [x] Escape AI-generated quiz text/options/explanations before rendering
- [x] Escape AI-generated mindmap labels/descriptions before rendering
- [x] Sanitize color input used in inline styles (`safeCssColor`)
- [x] Move from inline `onclick` to delegated event listeners (reduce XSS surface)

## Phase 4 — File Handling Quality
- [ ] Implement real PDF text extraction (client or backend parser)
- [ ] Implement real DOCX extraction (zip/xml parse or backend parser)
- [x] Add size limit and user warning for oversized files (10MB max)

## Phase 5 — Test & CI
- [ ] Add automated integration tests for API tasks (`plan/quiz/mindmap/feedback`)
- [ ] Add Playwright UX flow tests (session create/delete, mobile sidebar, quiz flow)
- [ ] Add security checks in CI (secret scan + npm audit gate)
- [ ] Update `wrangler` to latest major and re-run audit

## Notes
- ✅ Done items in this file are already implemented in current working tree.
- ⚠️ Manual steps are required for key rotation/history purge and Cloudflare secret updates.

---

## Completed in Latest Round (2026-03-14)

### ✅ Removed All Inline `onclick` Handlers (Phase 3)
- Converted 8 inline handlers to delegated event listeners
- Timeline buttons: Feedback, Quiz, MindMap (using `data-action` + `data-day`)
- Modal submit buttons: Feedback, Quiz (both API + fallback)
- Download mindmap buttons (both API + fallback)
- Result: Lower XSS attack surface, better CSP compatibility

### ✅ File Size Validation (Phase 4)
- Added 10MB max file size check before processing
- Shows localized error message (AR/EN) for oversized files
- Stores file size in session for future reference
- Gracefully handles size errors without crashing

---

## Remaining High-Priority Items
1. **Manual Security Actions** (Phase 0): Rotate API key, purge Git history
2. **File Extraction** (Phase 4): Real PDF/DOCX parsing (currently stubs)
3. **Testing** (Phase 5): Integration tests + E2E flows

