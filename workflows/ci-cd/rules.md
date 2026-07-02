# CI/CD Pipeline — Niyam Rules

## Purpose

CI/CD exists to provide fast, reliable feedback and safe, repeatable deployments.
Every commit that reaches main should be deployable. The pipeline is the quality gate —
if it passes, the code is ready. If it doesn't, nothing ships.

## Standards

### Pipeline Stages (in order)

1. **Install**: restore dependencies from cache. Fail fast on resolution errors.
2. **Lint & Format**: static analysis, formatting check. Fastest feedback first.
3. **Type Check**: compile / type verification. Catch type errors before tests.
4. **Unit Tests**: fast, isolated, parallelized. Target < 2 minutes.
5. **Build**: compile production artifacts. Verify the build succeeds.
6. **Integration Tests**: test with real dependencies (database, services). Containerized.
7. **Security Scan**: SAST, dependency audit, secret detection.
8. **Deploy to Staging**: automatic on main branch. Mirror production environment.
9. **E2E Tests**: against staging environment. Critical paths only.
10. **Deploy to Production**: manual approval gate or automated canary.

### Caching

11. Cache dependencies aggressively: `node_modules`, `.pip`, `.m2`, `.gradle`.
12. Cache key includes lockfile hash. Bust cache when dependencies change.
13. Cache build artifacts between stages. Don't rebuild what hasn't changed.
14. Docker layer caching: order Dockerfile from least to most frequently changing.
15. Cache test results for unchanged code paths (where tooling supports it).

### Parallel Jobs

16. Run lint, type-check, and unit tests in parallel — they're independent.
17. Shard test suites across runners for large test bases. Balance by execution time.
18. Security scans run in parallel with tests — don't block on non-critical paths.
19. Use matrix builds for multi-platform/version testing.
20. Limit parallelism to avoid resource exhaustion in shared runners.

### Environment Promotion

21. Artifacts are built ONCE and promoted between environments. Never rebuild for production.
22. Environment-specific config via environment variables or secrets manager — not baked into builds.
23. Promotion path: dev -> staging -> production. No skipping stages.
24. Staging mirrors production exactly: same infra, same scale (or close), same config shape.
25. Feature flags enable code to exist in production without being active.

### Secrets in CI

26. Never hardcode secrets in pipeline config files. Use CI platform's secret storage.
27. Secrets available only to the stages that need them. Least privilege per job.
28. Rotate CI secrets on the same schedule as production secrets.
29. Audit secret access in CI logs. Mask secret values in output.
30. Separate secrets per environment: staging secrets cannot access production resources.

### Rollback Strategies

31. Every deployment must be reversible within 5 minutes.
32. Keep previous N deployment artifacts available for instant rollback.
33. Database migrations must be backward-compatible. Deploy migration before code that uses it.
34. Rollback triggers: error rate spike, latency increase, health check failure.
35. Automated rollback on health check failure during canary deployments.

### Artifact Management

36. Tag artifacts with commit SHA and build number. Immutable once published.
37. Container images: multi-stage builds, minimal base images, scanned for vulnerabilities.
38. Store artifacts in a registry with retention policy. Don't keep everything forever.
39. Sign artifacts in production pipelines. Verify signatures before deployment.

## Process

1. Developer pushes branch or opens PR — CI runs lint/test/build.
2. PR merge to main — full pipeline including staging deploy and e2e tests.
3. Manual approval (or automated gate) promotes staging artifact to production.
4. Post-deploy: smoke tests verify critical paths. Alert on failure.
5. Monitors confirm stability. Auto-rollback if SLOs violated.

## Automation

- Pipeline-as-code: version pipeline definitions alongside application code.
- Auto-retry flaky infrastructure failures (network timeouts) — max 2 retries.
- Notify on failure: Slack/Teams/email. Include commit author and failure reason.
- Dashboard: pipeline success rate, average duration, flaky test frequency.
- Scheduled pipelines for dependency updates and security scans.

## Anti-Patterns

- **Works on My Machine**: no reproducible build environment. Use containers or lockfiles.
- **Slow Pipelines**: 30+ minute feedback loops. Parallelize, cache, and trim.
- **Secrets in Code**: API keys in yaml files committed to repo. Use secret managers.
- **Deploy on Friday**: shipping without monitoring coverage. Deploy when you can respond.
- **No Rollback Plan**: deploying without a tested revert path. Always have a rollback.
- **Skipping Stages**: deploying to prod without staging verification. Follow the promotion path.
- **Ignoring Flakes**: "it's just flaky" becomes "we don't trust CI." Fix or delete flaky tests.
- **Manual Deployments**: clicking buttons in UIs. Automate everything repeatable.
