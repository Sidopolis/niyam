# Git Workflow — Niyam Rules

## Purpose

Git is not a backup tool — it is a communication tool. Every commit tells a story.
Clean history enables debugging (bisect), understanding (blame), and collaboration (review).
Conventions exist so tooling can automate changelogs, versioning, and release notes.

## Standards

### Conventional Commits

1. Format: `<type>(<scope>): <description>` — all lowercase, no period at end.
2. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
3. Breaking changes: append `!` after type/scope: `feat(api)!: remove deprecated endpoint`.
4. Body: explain WHY, not what. The diff shows what changed.
5. Footer: `BREAKING CHANGE:`, `Closes #123`, `Refs #456`.
6. Subject line: imperative mood, under 72 characters. "Add feature" not "Added feature".

### Branch Naming

7. Pattern: `<type>/<ticket-id>-<short-description>` — e.g., `feat/PROJ-123-user-auth`.
8. Types mirror commit types: `feat/`, `fix/`, `refactor/`, `docs/`, `chore/`.
9. Use kebab-case. No uppercase, no underscores, no spaces.
10. Short-lived branches only. Merge within days, not weeks.
11. Delete branches after merge. No stale branches in remote.

### Commit Discipline

12. One logical change per commit. "Add X and fix Y" is two commits.
13. Never commit broken code to shared branches. Commits should compile and pass tests.
14. Atomic commits: revert-friendly. Each commit is a complete, working state.
15. Stage specific files. Never `git add .` without reviewing what's staged.
16. Commit messages are for humans 6 months from now. Write for future-you.

### PR Size and Structure

17. PRs under 400 lines changed. Over 400: split into stacked PRs.
18. One concern per PR. "Feature + refactor + bug fix" is three PRs.
19. PR description includes: what changed, why, how to test, what to look for in review.
20. Include screenshots/recordings for UI changes.
21. Draft PRs for work-in-progress. Mark ready only when CI passes.

### Rebase vs Merge

22. Rebase feature branches onto main before merging. Linear history is easier to bisect.
23. Never rebase shared/public branches. Only rebase your own unpushed work.
24. Squash merge for single-purpose PRs. Regular merge for multi-commit PRs with meaningful history.
25. Resolve conflicts on the feature branch, not on main.

### Hooks and Automation

26. Pre-commit: lint, format, type-check staged files. Fast (< 5 seconds).
27. Commit-msg: validate conventional commit format.
28. Pre-push: run fast test suite. Block push on failure.
29. Use `husky` + `lint-staged` (JS) or `pre-commit` framework (Python) for hook management.
30. Never skip hooks (`--no-verify`) unless explicitly justified and temporary.

## Process

1. Pull latest main. Create branch from it.
2. Make changes in atomic commits following conventional format.
3. Push branch. Open PR with description template filled.
4. Address review feedback in new commits (don't force-push during review).
5. After approval: rebase onto latest main, squash if appropriate, merge.
6. Delete the feature branch after merge.

## Automation

- Commitlint in CI validates all commit messages on PR.
- Semantic-release or similar generates versions and changelogs from commits.
- Branch protection: require CI pass + 1 approval before merge to main.
- Auto-delete merged branches via repository settings.
- Dependabot/Renovate for dependency update PRs with auto-merge on passing CI.

## Anti-Patterns

- **WIP Commits on Main**: `"wip"`, `"fix stuff"`, `"asdf"` on shared branches. Use proper messages.
- **Mega PRs**: 2000-line PRs that no one can review. Split by concern.
- **Long-Lived Branches**: branches alive for weeks diverge painfully. Merge frequently.
- **Force Push to Shared Branches**: rewrites others' history. Only force-push personal branches.
- **Secrets in Commits**: `.env` files, API keys in history. Use `.gitignore` and secrets manager.
- **Meaningless Merge Commits**: `"Merge branch 'main' into feature"` noise. Rebase instead.
- **Ignoring .gitignore**: committing `node_modules`, `.DS_Store`, build artifacts. Configure early.
- **Mixing Concerns**: refactor + feature + fix in one commit. Separate them.
