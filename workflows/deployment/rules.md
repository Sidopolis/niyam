# Deployment — Niyam Rules

## Purpose

Deployment should be boring. A boring deployment means it's automated, repeatable, reversible,
and observable. The goal: ship any commit to production with confidence, at any time,
without heroics or anxiety.

## Standards

### Deployment Strategies

1. **Blue-Green**: two identical environments. Switch traffic atomically. Instant rollback.
2. **Canary**: route small percentage of traffic to new version. Expand on success.
3. **Rolling**: update instances incrementally. Maintain capacity throughout.
4. **Feature Flags**: deploy code dark, enable for subsets of users. Decouple deploy from release.
5. Choose strategy based on risk tolerance: canary for high-risk, blue-green for instant rollback.

### Zero-Downtime Deployments

6. No maintenance windows for routine deployments. Zero-downtime is the default.
7. Backward-compatible changes: new code must work with old data and old API clients.
8. Database migrations run BEFORE deploying new code. Schema supports both old and new code.
9. API versioning: never break existing contracts. Deprecate, don't remove.
10. Graceful shutdown: drain connections, finish in-flight requests before terminating.
11. Health checks: liveness (is the process alive?) and readiness (can it serve traffic?).

### Database Migrations

12. Migrations are forward-only in production. Never rollback a migration — write a new one.
13. Every migration must be backward-compatible with the currently running code.
14. Expand-Contract pattern: add new column -> deploy code using it -> remove old column.
15. No locks on large tables in production migrations. Use online schema change tools.
16. Test migrations against production-sized data before applying. Time them.
17. Separate migration deployment from application deployment. Migrate first, deploy second.

### Health Checks and Readiness

18. Liveness probe: responds if process is alive. Restart if failing.
19. Readiness probe: responds when ready to serve traffic. Remove from load balancer if failing.
20. Startup probe: allow time for initialization. Don't declare unhealthy during boot.
21. Health checks verify dependencies: database, cache, required services.
22. Deep health checks on a separate endpoint (not the fast liveness check).

### Feature Flags

23. Use feature flags to decouple deployment from release. Deploy daily, release when ready.
24. Flags have owners, expiration dates, and removal tickets. No permanent flags.
25. Flag types: release (temporary), ops (kill switches), experiment (A/B), permission (entitlement).
26. Clean up flags within 2 weeks of full rollout. Stale flags are tech debt.
27. Test both flag states. Code with flag on and off must work correctly.

### Observability

28. Every deployment is observable: metrics, logs, traces available before and after.
29. Key metrics: error rate, latency p50/p95/p99, throughput, saturation.
30. Compare metrics before/after deployment automatically. Alert on regression.
31. Structured logging with correlation IDs across services.
32. Distributed tracing for multi-service architectures. Trace every request.

### Incident Response

33. Rollback first, investigate second. Restore service before finding root cause.
34. Rollback decision: if error rate exceeds baseline by 2x OR latency doubles, roll back.
35. Post-incident: blameless retrospective within 48 hours. Focus on systems, not people.
36. Action items from incidents become tickets with owners and deadlines.
37. On-call rotation: clear escalation path, runbooks for common failures.

## Process

1. Code merged to main triggers build and staging deployment.
2. Staging: automated smoke tests and e2e tests verify the deployment.
3. Production deployment: canary to 5% -> monitor 15 min -> expand to 25% -> 100%.
4. Post-deploy: verify dashboards, check error rates, confirm health checks green.
5. If any metric degrades: automatic or manual rollback within 5 minutes.
6. Mark deployment in monitoring tools for before/after comparison.

## Automation

- Infrastructure as Code: Terraform, Pulumi, or CloudFormation. No manual infra changes.
- Deployment pipelines triggered automatically on merge to main.
- Canary analysis: automated comparison of canary vs baseline metrics.
- Auto-rollback on health check failure or error rate threshold breach.
- Deployment notifications: Slack/Teams with commit list, author, and dashboard link.
- Scheduled deployments for non-urgent changes (avoid Friday deploys without coverage).

## Anti-Patterns

- **Big Bang Deploys**: deploying weeks of changes at once. Ship small, ship often.
- **Manual Deployments**: SSH into production and running scripts. Automate everything.
- **No Rollback Plan**: deploying without a tested revert mechanism. Always have a rollback.
- **Breaking Migrations**: schema changes that break running code. Use expand-contract.
- **Deploy and Pray**: no monitoring after deployment. Watch metrics for 15+ minutes.
- **Permanent Feature Flags**: flags that never get cleaned up. Set expiry dates.
- **Friday Deploys**: shipping when no one will be around to respond. Deploy responsibly.
- **Ignoring Graceful Shutdown**: killing processes with active connections. Drain first.
