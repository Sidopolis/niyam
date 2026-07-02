# Security First — Niyam Rules

## Philosophy

Security is not a feature — it is a property of the system. Every layer assumes the others have failed.
Zero Trust: never trust, always verify. Every input is hostile. Every boundary is a checkpoint.
Based on OWASP Top 10, Zero Trust Architecture, and defense-in-depth methodology.

## Core Rules

### Input Validation

1. Validate ALL input at every trust boundary. Client validation is UX, not security.
2. Allowlist over denylist. Define what IS valid, reject everything else.
3. Validate type, length, range, and format. Reject before processing.
4. Validate semantically: is this user ID one the caller is authorized to access?
5. Never trust HTTP headers, cookies, URL parameters, form fields, or file uploads.
6. Canonicalize before validation: decode, normalize, then validate.
7. File uploads: validate MIME type (magic bytes, not extension), enforce size limits, store outside webroot.

### Output Encoding

8. Encode output based on context: HTML, JavaScript, URL, CSS, SQL each need different encoding.
9. Use framework-provided auto-escaping. Never concatenate raw user input into templates.
10. Content-Security-Policy headers: restrict inline scripts, define allowed sources.
11. Set `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`.
12. API responses: set explicit `Content-Type`, never reflect raw input in error messages.

### Parameterized Queries

13. NEVER concatenate user input into SQL, LDAP, OS commands, or any query language.
14. Use parameterized queries / prepared statements for ALL database operations — no exceptions.
15. ORMs do not guarantee safety. Verify raw query usage in ORM code.
16. Stored procedures are not a defense unless they also use parameters internally.

### Authentication

17. Hash passwords with bcrypt/scrypt/argon2. Never MD5/SHA1/SHA256 alone.
18. Enforce minimum password entropy, not arbitrary complexity rules.
19. Implement rate limiting on authentication endpoints. Lock after N failures.
20. Session tokens: cryptographically random, 128+ bits, rotate on privilege change.
21. Multi-factor authentication for privileged operations.
22. Invalidate all sessions on password change.

### Authorization

23. Check authorization on EVERY request. Never rely on UI hiding alone.
24. Default deny. Explicitly grant access, never explicitly deny.
25. Implement authorization at the data layer, not just the route layer.
26. Principle of Least Privilege: grant minimum permissions required.
27. Separation of duties: no single role can both request and approve.
28. Time-bound access: tokens expire, sessions timeout, permissions are reviewed.

### Secrets Management

29. Never hardcode secrets in source code, configs, or environment variables committed to VCS.
30. Use secrets managers (Vault, AWS Secrets Manager). Rotate regularly.
31. Different secrets per environment. Production secrets are NEVER in dev configs.
32. Audit secret access. Alert on unusual patterns.
33. Encrypt secrets at rest and in transit. Minimum TLS 1.2.

### Defense in Depth

34. Multiple independent security controls. If one fails, others still protect.
35. Network segmentation: separate public-facing, application, and data tiers.
36. Fail secure: on error, deny access rather than grant it.
37. Secure defaults: new accounts have minimum permissions, features are opt-in.
38. Log security-relevant events: auth failures, privilege changes, data access.
39. Sanitize logs: never log passwords, tokens, PII, or full credit card numbers.

### Dependency Security

40. Pin dependency versions. Audit with `npm audit`, `pip-audit`, `snyk`.
41. Review new dependencies before adding: maintenance status, download count, known vulns.
42. Automated vulnerability scanning in CI. Block merges on critical/high CVEs.
43. Keep frameworks and runtime patched. Track CVE announcements.

### API Security

44. Authenticate every API request. No unauthenticated endpoints except health checks.
45. Rate limit all endpoints. Stricter limits on write operations.
46. Validate request size. Reject oversized payloads before parsing.
47. Use CORS restrictively. Never `Access-Control-Allow-Origin: *` in production.

## Implementation Guidelines

- Threat model before implementation. Identify assets, threats, and trust boundaries.
- Use OWASP ASVS as a verification checklist appropriate to the application's risk level.
- Security unit tests: test that invalid input IS rejected, unauthorized access IS denied.
- Automate security scanning: SAST (static), DAST (dynamic), SCA (dependencies) in CI.
- Document security decisions: why a control exists, what it protects against.

## Anti-Patterns

- **Security by Obscurity**: relying on hidden URLs or obfuscated code. Assume attacker has source.
- **Trust the Client**: validation only on frontend. Backend must re-validate everything.
- **Catch-All Suppress**: `catch (Exception e) {}` hiding security errors. Log and fail secure.
- **Shared Credentials**: one API key for all environments/services. Isolate and rotate.
- **Overly Permissive CORS/IAM**: `Allow *` anywhere. Be explicit about what is allowed.
- **Plaintext Storage**: passwords, tokens, or PII stored unencrypted. Encrypt at rest.
- **Missing Rate Limiting**: no throttling on auth or API endpoints. Always limit.
- **Logging Secrets**: printing tokens or passwords in logs. Sanitize all log output.

## Verification

- [ ] All input validated at server side with allowlist approach
- [ ] Output encoded per context (HTML, JS, URL, SQL)
- [ ] Zero string concatenation in queries — parameterized only
- [ ] Passwords hashed with argon2/bcrypt/scrypt
- [ ] Authorization checked on every endpoint at the data layer
- [ ] No secrets in source code or version control
- [ ] CSP headers, HSTS, and security headers configured
- [ ] Dependency vulnerability scan passes in CI
- [ ] Rate limiting active on auth and mutation endpoints
- [ ] Security-relevant events logged without exposing sensitive data
