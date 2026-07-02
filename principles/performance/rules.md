# Performance — Niyam Rules

## Philosophy

Measure, don't guess. Performance optimization without profiling is superstition.
Based on Brendan Gregg's methodology and Core Web Vitals: identify bottlenecks with data,
fix the biggest one, measure again. Premature optimization is the root of all evil — but
negligent performance is the root of bad UX.

## Core Rules

### Measure Before Optimizing

1. Never optimize without a benchmark showing the problem. "It feels slow" is not evidence.
2. Profile in production-like conditions. Dev mode performance is meaningless.
3. Identify the bottleneck FIRST. Optimizing non-bottleneck code is wasted effort.
4. Set performance budgets: page load < 3s, API response < 200ms, bundle < 200KB.
5. Measure after every change. Confirm improvement with numbers, not intuition.

### Brendan Gregg's Methodology (USE/RED)

6. USE for resources: Utilization, Saturation, Errors on every resource (CPU, memory, disk, network).
7. RED for services: Rate, Errors, Duration on every service endpoint.
8. Start with the highest-utilization resource or highest-latency endpoint.
9. Check saturation: queued work indicates the resource is the bottleneck.
10. Flame graphs for CPU profiling. Allocation profiling for memory.

### Core Web Vitals

11. LCP (Largest Contentful Paint) < 2.5s. Optimize critical rendering path.
12. INP (Interaction to Next Paint) < 200ms. Keep main thread unblocked.
13. CLS (Cumulative Layout Shift) < 0.1. Reserve space for dynamic content.
14. Measure with real user monitoring (RUM), not just lab tools.
15. Prioritize above-the-fold content. Defer everything else.

### Caching Strategy

16. Cache at every layer: browser, CDN, application, database query, computed results.
17. Cache invalidation is the hard problem. Use TTL + event-based invalidation.
18. Cache-Control headers: `immutable` for hashed assets, `no-cache` for dynamic content.
19. Application caching: memoize expensive computations with bounded cache size (LRU).
20. Database: query result caching, connection pooling, prepared statement caching.
21. Never cache authenticated/personalized content in shared caches.

### Frontend Performance

22. Lazy load below-the-fold images and components. Use `loading="lazy"` and dynamic imports.
23. Tree shake unused code. Analyze bundles with webpack-bundle-analyzer or equivalent.
24. Code split by route. No single bundle > 150KB gzipped for initial load.
25. Preload critical resources: fonts, hero images, key scripts.
26. Use `srcset` and responsive images. Don't serve 4K images to mobile.
27. Minimize main thread work: move computation to Web Workers when > 50ms.
28. Avoid layout thrashing: batch DOM reads, then batch DOM writes.

### Database Performance

29. Every query path must have appropriate indexes. Explain plans are mandatory for new queries.
30. N+1 queries: detect and eliminate. Use eager loading or batch fetching.
31. Pagination: use cursor-based for large datasets, offset for small ones.
32. Connection pooling: always. Size pool based on load testing, not guessing.
33. Read replicas for read-heavy workloads. Write to primary only.
34. Denormalize for read performance when justified by benchmarks.

### Backend Performance

35. Async/non-blocking I/O for network calls. Never block a thread waiting for I/O.
36. Connection reuse: HTTP keep-alive, connection pools for databases and services.
37. Compress responses: gzip/brotli for text content > 1KB.
38. Pagination and limits on all list endpoints. No unbounded queries.
39. Background jobs for work that doesn't need synchronous response.

## Implementation Guidelines

- Set performance budgets in CI: fail builds that exceed bundle size or lighthouse score thresholds.
- Load test before release: establish baselines, identify breaking points.
- Use observability tools: distributed tracing, APM, real user monitoring.
- Profile memory: detect leaks with heap snapshots under sustained load.
- Review database queries in code review: every new query needs EXPLAIN output.
- Optimize images at build time: WebP/AVIF, appropriate dimensions, compression.

## Anti-Patterns

- **Premature Optimization**: optimizing without evidence of a problem. Measure first.
- **Optimizing the Wrong Thing**: fast code on a non-bottleneck path. Profile first.
- **N+1 Queries**: fetching related data in a loop. Batch or join.
- **Unbounded Results**: `SELECT *` without LIMIT. Always paginate.
- **Missing Indexes**: full table scans on frequent queries. Check EXPLAIN plans.
- **Over-Caching**: stale data everywhere. Define invalidation strategy with every cache.
- **Synchronous Everything**: blocking on I/O in request handlers. Use async.
- **Bundle Bloat**: importing entire libraries for one function. Use tree-shakeable imports.
- **No Performance Budget**: no limits defined means no accountability. Set budgets early.

## Verification

- [ ] Performance budgets defined and enforced in CI
- [ ] Core Web Vitals meet thresholds (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- [ ] All database queries have appropriate indexes (verified with EXPLAIN)
- [ ] No N+1 queries in production code paths
- [ ] Bundle size within budget, tree shaking active
- [ ] Caching strategy documented with invalidation approach for each layer
- [ ] Load testing performed with results documented before release
- [ ] No unbounded queries — all list endpoints paginated
- [ ] Critical rendering path optimized — above-fold content prioritized
- [ ] Async I/O used for all network and database operations
