# Django 5+ — Niyam Rules

## Core Principles

1. **Fat models, thin views.** Business logic lives in models and services, not in views.
2. **Don't repeat yourself.** Use Django's built-in tools before writing custom code.
3. **Explicit querysets.** Always be intentional about what data you fetch. No lazy N+1 queries.
4. **Security by default.** Use Django's built-in protections. Don't disable CSRF, XSS, or SQL injection guards.
5. **Test everything.** Django's test framework is batteries-included. Use it.

## File Structure & Organization

```
project/
  manage.py
  config/              # Project settings
    settings/
      base.py
      development.py
      production.py
    urls.py
    wsgi.py
  apps/
    users/
      models.py
      views.py
      serializers.py   # DRF
      services.py      # Business logic
      selectors.py     # Complex queries
      urls.py
      admin.py
      tests/
        test_models.py
        test_views.py
        factories.py   # Factory Boy
```

- Split settings into base/dev/prod. Never put secrets in settings files.
- One app per domain concept. Apps should be loosely coupled.
- Services layer for complex business logic that spans multiple models.
- Selectors for complex read queries (keeps views thin).

## Patterns & Best Practices

### ORM & QuerySets
- Always use `select_related()` for ForeignKey/OneToOne (JOIN).
- Always use `prefetch_related()` for ManyToMany/reverse ForeignKey.
- Use `.only()` or `.defer()` to limit fields when you don't need everything.
- Use `F()` expressions for database-level operations (avoid race conditions).
- Use `Q()` objects for complex lookups.
- Use `.exists()` instead of `len(qs) > 0` or `bool(qs)`.
- Use `bulk_create()` and `bulk_update()` for batch operations.
- Use `iterator()` for large querysets to avoid loading all into memory.

### Class-Based Views
- Use generic views when they match the pattern exactly.
- Override `get_queryset()` for filtered lists. Override `perform_create()` for custom save logic.
- Use mixins for shared behavior across views.
- Prefer function-based views for simple, one-off endpoints.

### DRF Serializers
- Use `ModelSerializer` for standard CRUD. Custom serializers for complex input/output.
- Validate at the serializer level with `validate_<field>` and `validate()`.
- Use `SerializerMethodField` for computed read-only fields.
- Separate read and write serializers when shapes differ significantly.
- Use `select_related`/`prefetch_related` in the viewset's `get_queryset()`.

### Middleware
- Keep middleware thin. Do one thing per middleware class.
- Order matters: authentication before authorization before business logic.
- Use `process_request` for pre-processing, `process_response` for post-processing.

### Signals
- Use signals sparingly — they obscure control flow.
- Never use signals for business logic. Use explicit service calls.
- Acceptable uses: cache invalidation, audit logging, denormalization.
- Always use `dispatch_uid` to prevent duplicate signal registration.

### Celery Tasks
- Tasks must be idempotent. Design for at-least-once delivery.
- Use `bind=True` and `self.retry()` for automatic retries with backoff.
- Keep tasks small. Pass IDs, not objects (objects may change between enqueue and execute).
- Set `task_time_limit` and `task_soft_time_limit`.
- Use `transaction.on_commit()` to enqueue tasks after DB commit.

## Anti-Patterns (Never Do)

- Never use raw SQL without parameterization.
- Never query the database in a loop (N+1). Always batch with `select_related`/`prefetch_related`.
- Never put business logic in signals — use explicit service functions.
- Never use `Model.objects.all()` in production views without filtering/pagination.
- Never store secrets in `settings.py` — use environment variables.
- Never disable CSRF protection without an alternative (e.g., token auth for APIs).
- Never use `exclude()` for permissions — use `filter()` (allowlist, not denylist).
- Never use `update()` when you need `save()` signals/validation to fire.

## Performance

- Use Django Debug Toolbar in development to catch N+1 queries.
- Use database indexes (`db_index=True`, `Meta.indexes`) for filtered/ordered fields.
- Use `cached_property` for expensive model methods accessed multiple times.
- Use Django's cache framework (`cache.get`/`cache.set`) for expensive computations.
- Use pagination for all list endpoints.
- Use `defer()`/`only()` for views that don't need all fields.
- Use `count()` instead of `len(queryset)` for counting.

## Testing

- Use `pytest-django` with `@pytest.mark.django_db` for database tests.
- Use Factory Boy for test data creation (not fixtures).
- Use `APIClient` for DRF endpoint tests.
- Use `override_settings` for testing with different configurations.
- Use `TransactionTestCase` only when testing transaction behavior.
- Test permissions separately from business logic.
- Use `freezegun` for time-dependent tests.

```python
@pytest.mark.django_db
def test_create_user(api_client: APIClient, admin_user: User) -> None:
    api_client.force_authenticate(admin_user)
    response = api_client.post('/api/users/', {'email': 'new@test.com', 'name': 'New'})
    assert response.status_code == 201
    assert User.objects.filter(email='new@test.com').exists()
```

## Security

- Keep `SECRET_KEY` out of version control. Use environment variables.
- Enable all default middleware (CSRF, XSS, clickjacking protection).
- Use `django.contrib.auth` for authentication. Don't roll your own.
- Set `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE` in production.
- Use `bleach` or similar for sanitizing user HTML input.
- Run `python manage.py check --deploy` before deploying.
- Set `ALLOWED_HOSTS` explicitly. Never use `['*']` in production.
