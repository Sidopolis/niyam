# Code Review — Niyam Rules

## Purpose

Code review is a quality gate AND a knowledge-sharing mechanism. It catches bugs,
enforces standards, spreads context, and mentors team members. Reviews should be
timely, constructive, and focused on what matters.

## Standards

### Review Priorities (in order)

1. **Correctness**: Does it work? Does it handle edge cases? Are there bugs?
2. **Security**: Are there vulnerabilities? Input validation? Auth checks?
3. **Design**: Is the architecture sound? Will it scale? Is it maintainable?
4. **Readability**: Can a new team member understand this in 5 minutes?
5. **Performance**: Are there obvious inefficiencies? N+1 queries? Memory leaks?
6. **Style**: formatting, naming conventions. Lowest priority — automate with linters.

### PR Description Template

7. Every PR includes: **What** changed, **Why** it changed, **How** to test it.
8. Link to the ticket/issue. No orphan PRs without context.
9. Call out risks: "This touches the payment flow" or "Migration on a large table."
10. Include before/after screenshots for UI changes.
11. Note what you want reviewers to focus on: "Please check the error handling in X."

### Feedback Style

12. Criticize the code, never the person. "This function does too much" not "You wrote bad code."
13. Explain WHY, not just what. "Extract this because it has a different rate of change."
14. Suggest, don't demand. "Consider extracting this" or "What about using X instead?"
15. Distinguish blocking vs non-blocking: prefix with `nit:`, `suggestion:`, or `blocking:`.
16. Praise good work. Acknowledge clever solutions, clean refactors, thorough tests.
17. Ask questions when unsure: "What happens if X is null here?" not "This doesn't handle null."

### What to Approve

18. Approve when: correct, secure, readable, tested, and follows project conventions.
19. Approve with nits: minor style issues that don't affect correctness. Author can fix or not.
20. Don't block on subjective preferences. "I would do it differently" is not a block.

### What to Request Changes

21. Bugs or incorrect behavior.
22. Security vulnerabilities or missing authorization checks.
23. Missing tests for changed behavior.
24. Breaking API changes without versioning or migration path.
25. Violations of critical project conventions that affect other developers.

### Response Time

26. First review response within 4 business hours. Faster for small PRs.
27. If you can't review in time, say so and suggest another reviewer.
28. Author responds to all comments — either fix, explain, or acknowledge.
29. Don't let PRs sit in review for more than 2 business days. Escalate if blocked.
30. Small PRs (< 100 lines) get priority — review same day.

## Process

1. Author self-reviews before requesting review. Catch obvious issues yourself.
2. Author assigns 1-2 reviewers with relevant context.
3. Reviewer provides feedback within 4 hours.
4. Author addresses feedback: new commits for fixes, replies for discussions.
5. Reviewer re-reviews addressed comments. Approves when satisfied.
6. Author merges after approval and CI pass.

## Automation

- Linters and formatters run automatically — don't waste review time on style.
- CI must pass before review is requested. Don't review broken code.
- Auto-assign reviewers based on code ownership (CODEOWNERS file).
- PR size check: warn on PRs > 400 lines, block > 800 lines.
- Stale PR bot: notify after 48 hours without activity. Close after 2 weeks.
- Required approvals: minimum 1 for standard PRs, 2 for security/infra/API changes.
- Auto-label PRs based on files changed (frontend, backend, infra, docs).

## Anti-Patterns

- **Rubber Stamping**: approving without reading. Every approval is a quality guarantee.
- **Nitpick Avalanche**: 30 comments about formatting. Use linters for style.
- **Gatekeeping**: blocking PRs for personal style preferences. Focus on correctness.
- **Ghost Reviewer**: assigned but never responds. Reassign after SLA breach.
- **PR Ping-Pong**: endless back-and-forth on subjective choices. Timebox and decide.
- **Review as Status**: using reviews to demonstrate seniority. Reviews are collaborative.
- **Mega PRs**: reviewing 2000 lines in one sitting. Ask author to split.
- **No Context Reviews**: reviewing code without understanding the ticket. Read the why first.
- **Delayed Reviews**: sitting on PRs for days. Review is highest priority after your own work.
