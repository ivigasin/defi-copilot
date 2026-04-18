---
description: Ensures every change includes unit, integration, and e2e test work. Use automatically after code changes and before completion.
---

# Mandatory test workflow

When code changes are made:

1. Inspect changed files.
2. Classify test needs:
   - unit
   - integration
   - e2e
3. Delegate:
   - unit logic -> @agent-unit-test-writer
   - service/repository/api/db boundaries -> @agent-integration-test-writer
   - user flow / cross-system behavior -> @agent-e2e-test-writer
4. If any category is skipped, write a justification.
5. Run the appropriate test commands.
6. Do not declare completion unless test work is done.

Final output format:
- Changed files
- Unit tests added/updated
- Integration tests added/updated
- E2E tests added/updated
- Commands run
- Pass/fail status
- Gaps / follow-ups
