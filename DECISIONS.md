# Architecture & Design Decisions

## AI Civic Guardian - Karur Municipality

### D-001: JSON File Storage (not SQLite)
**Decision:** Use JSON files with thread-safe locking instead of SQLite for the demo phase.
**Reason:** Easier to inspect data, no schema migrations, simpler setup for reviewers.
**Migration:** Replace only `repos/json_repo.py` with `repos/supabase_repo.py` when moving to production.

### D-002: Stub Detector Mode
**Decision:** When `weights/civic.pt` is absent, use a hash-based stub detector that deterministically returns results.
**Reason:** Allows UI to be fully tested without YOLO installation.
**UI:** Shows a "Demo AI" badge to clearly indicate stub mode.

### D-003: Template Fallback for AI Text
**Decision:** When OpenRouter key is missing or call fails, use bilingual template text.
**Source field:** `draft_source` returns `"ai"` or `"template"`.

### D-004: Duplicate Detection Threshold
**Decision:** 30m haversine distance, same issue_type, non-resolved/rejected status.
**Reason:** Matches typical GPS accuracy and urban block spacing.

### D-005: Frontend Language Default
**Decision:** Default to Tamil (`ta`) for new citizens, English for officers/admin.
**Persistence:** Saved in `localStorage` as `civic_lang`.

### D-006: Comment Routing
**Decision:** Comment endpoints use full paths in router (not mounted with prefix) to support both `/complaints/{id}/comments` and `/comments/{id}` patterns.

### D-007: Status Transition Enforcement
**Decision:** Server-side only. Valid transitions: Submitted→Acknowledged/Rejected, Acknowledged→InProgress/Rejected, InProgress→Resolved/Rejected, Resolved→InProgress (reopen).

### D-008: Resolution Photo Enforcement
**Decision:** Resolving a complaint REQUIRES a resolution photo upload. No photo = 400 error.

### D-009: Civic Points System
**Decision:** +10 report accepted, +20 resolved, +5 per support (capped), +2 per helpful comment.
**Badges:** Computed on-the-fly from complaint and activity history.

### D-010: Map Center
**Decision:** Karur coordinates `[10.9574, 78.0809]`, zoom 13. All seeded data is within 5km radius.
