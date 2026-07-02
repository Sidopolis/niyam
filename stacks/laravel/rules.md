# Laravel 11+ — Niyam Rules

## Core Principles

1. **Convention over configuration.** Follow Laravel conventions. Don't fight the framework.
2. **Eloquent expressiveness.** Use the ORM's full power — scopes, relationships, accessors, mutators.
3. **Request validation first.** Validate at the gate. Form Requests handle validation and authorization.
4. **Queue everything slow.** Email, notifications, API calls, PDF generation — all queued.
5. **Test with confidence.** Laravel's testing tools make it easy. No excuses for untested code.

## File Structure & Organization

```
app/
  Http/
    Controllers/
      UserController.php
    Middleware/
      EnsureEmailVerified.php
    Requests/
      StoreUserRequest.php
  Models/
    User.php
  Services/
    UserService.php
  Events/
    UserCreated.php
  Listeners/
    SendWelcomeEmail.php
  Jobs/
    ProcessPayment.php
  Policies/
    UserPolicy.php
routes/
  web.php
  api.php
resources/
  views/
    components/
      button.blade.php
database/
  migrations/
  factories/
  seeders/
tests/
  Feature/
  Unit/
```

- Controllers are thin — validate, delegate to services, return responses.
- Services contain business logic that doesn't belong in models.
- Form Requests handle validation AND authorization.
- Events + Listeners for decoupled side effects.
- Jobs for queued work. Always implement `ShouldQueue`.

## Patterns & Best Practices

### Eloquent Relationships & Scopes
- Define relationships in models. Always specify return types.
- Use eager loading: `User::with('posts', 'posts.comments')->get()`.
- Use local scopes for reusable query constraints.
- Use `withCount()`, `withSum()`, `withAvg()` for aggregate subqueries.
- Use `whereHas()` for filtering by relationship existence.

```php
class Post extends Model
{
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    public function scopeByAuthor(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->id);
    }
}
```

### Blade Components
- Use anonymous components (`resources/views/components/`) for simple UI.
- Use class-based components for complex logic.
- Pass data explicitly via props. Use `{{ $slot }}` for content projection.
- Use `@props` directive in anonymous components for type hints.
- Prefix with `x-`: `<x-button variant="primary">Submit</x-button>`.

### Middleware
- Keep middleware focused — one concern per middleware.
- Register middleware in route groups, not globally (unless truly global).
- Use middleware parameters: `->middleware('role:admin')`.
- Return early with appropriate HTTP responses on failure.

### Queues & Jobs
- All jobs implement `ShouldQueue`. Synchronous only for testing.
- Jobs are idempotent — safe to retry on failure.
- Use `$tries`, `$timeout`, `$backoff` properties.
- Use `release()` for delayed retry, `fail()` for permanent failure.
- Batch related jobs with `Bus::batch()`.
- Use `dispatch()->afterCommit()` to prevent race conditions.

### Events & Listeners
- Use events for decoupling. The event raiser doesn't know about listeners.
- Keep listeners focused — one listener per side effect.
- Queue listeners for non-critical work (emails, analytics).
- Use model events (`created`, `updated`) sparingly — prefer explicit dispatching.

### Sanctum Auth
- Use Sanctum for SPA auth (cookie-based) and API tokens.
- Use `auth:sanctum` middleware on protected routes.
- Token abilities for API authorization: `$token->can('posts:write')`.
- Use `createToken()` with expiration for security.

## Anti-Patterns (Never Do)

- Never query the database in Blade templates.
- Never put business logic in controllers — delegate to services.
- Never use raw queries without parameter binding.
- Never use `Model::all()` without pagination in web responses.
- Never disable mass assignment protection (`$guarded = []` without thought).
- Never skip Form Request validation and validate in controllers.
- Never use `env()` outside config files — it returns null when cached.
- Never store uploaded files in `public/` — use `Storage` facade.

## Performance

- Eager load relationships: prevent N+1 with `with()` and `load()`.
- Use `chunk()` or `lazy()` for processing large datasets.
- Cache expensive queries: `Cache::remember('key', $ttl, fn() => ...)`.
- Use database indexes on columns used in `where`, `orderBy`, `join`.
- Use `Queue` for anything that takes > 200ms.
- Use route caching (`php artisan route:cache`) in production.
- Use config caching (`php artisan config:cache`) in production.

## Testing

- Use Pest PHP as the testing framework.
- Feature tests for HTTP endpoints. Unit tests for services and domain logic.
- Use `RefreshDatabase` trait for database tests.
- Use factories for test data: `User::factory()->create()`.
- Use `actingAs()` for authenticated test requests.
- Use `assertDatabaseHas()` / `assertDatabaseMissing()` for persistence assertions.
- Use `Queue::fake()`, `Event::fake()`, `Notification::fake()` for side effects.

```php
test('user can create a post', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post('/api/posts', [
            'title' => 'Test Post',
            'body' => 'Content here',
        ]);

    $response->assertCreated();
    $this->assertDatabaseHas('posts', [
        'title' => 'Test Post',
        'user_id' => $user->id,
    ]);
});
```

## Security

- Always use Form Requests for validation — never trust input.
- Use Policies for authorization. Never check permissions in controllers directly.
- Use `bcrypt` or `argon2` for passwords (Laravel's default).
- Set `APP_DEBUG=false` in production.
- Use HTTPS only: `URL::forceScheme('https')` in production.
- Prevent mass assignment: define `$fillable` explicitly on every model.
- Use `signed` routes for email verification and sensitive actions.
- Rate limit API endpoints: `throttle:60,1` middleware.
- Escape output in Blade: `{{ }}` not `{!! !!}` unless sanitized.
