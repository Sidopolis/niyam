# FastAPI — Niyam Rules

## Core Principles

1. **Type-driven development.** Pydantic models define your API contract. Types generate docs automatically.
2. **Async by default.** Use `async def` for routes that do I/O. Use `def` only for CPU-bound work.
3. **Dependency injection everywhere.** Use `Depends()` for shared logic, auth, DB sessions.
4. **Validate at boundaries.** Pydantic validates all input. Never trust raw request data.
5. **Separation of concerns.** Routes handle HTTP, services handle business logic, repositories handle data.

## File Structure & Organization

```
app/
  main.py              # FastAPI app creation, middleware, startup
  config.py            # Settings via pydantic-settings
  dependencies.py      # Shared dependencies
  models/
    user.py            # SQLAlchemy/DB models
  schemas/
    user.py            # Pydantic request/response models
  routers/
    users.py           # Route definitions
    auth.py
  services/
    user_service.py    # Business logic
  repositories/
    user_repo.py       # Data access
tests/
  conftest.py
  test_users.py
```

- Separate Pydantic schemas from DB models. Never expose DB models in responses.
- Group routers by domain. Mount with `app.include_router()`.
- Keep `main.py` focused on app wiring, not business logic.
- Use `config.py` with `pydantic-settings` for typed environment configuration.

## Patterns & Best Practices

### Pydantic v2 Models
- Use `model_validator` for cross-field validation.
- Use `field_validator` for single-field validation.
- Separate `Create`, `Update`, and `Response` schemas.
- Use `model_config = ConfigDict(strict=True)` for strict type coercion.
- Use `Annotated[str, Field(min_length=1, max_length=255)]` for field constraints.

```python
class UserCreate(BaseModel):
    model_config = ConfigDict(strict=True)

    email: EmailStr
    name: Annotated[str, Field(min_length=1, max_length=100)]
    password: Annotated[str, Field(min_length=8)]

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    name: str
    created_at: datetime
```

### Dependency Injection
- Use `Depends()` for DB sessions, auth, pagination, and shared logic.
- Create reusable dependencies for common patterns.
- Use `Annotated` type aliases for cleaner signatures.
- Dependencies can depend on other dependencies (composable).

```python
CurrentUser = Annotated[User, Depends(get_current_user)]
DbSession = Annotated[AsyncSession, Depends(get_db)]

@router.get("/me")
async def get_profile(user: CurrentUser, db: DbSession) -> UserResponse:
    return await user_service.get_profile(db, user.id)
```

### Async Routes
- Use `async def` for routes with database, HTTP, or file I/O.
- Use `def` (sync) for CPU-bound routes — FastAPI runs them in a thread pool.
- Use `httpx.AsyncClient` for outbound HTTP requests.
- Use async database drivers (asyncpg, aiomysql).

### Background Tasks
- Use `BackgroundTasks` for fire-and-forget work after response (emails, logging).
- For complex/long-running tasks, use Celery or ARQ with a message broker.
- Background tasks share the same process — don't block with CPU-heavy work.

### WebSocket
- Use `WebSocket` class with `await websocket.accept()`.
- Handle `WebSocketDisconnect` exception for cleanup.
- Use connection managers for broadcasting to multiple clients.
- Authenticate on connection, not per-message.

### Middleware
- Use `@app.middleware("http")` for simple middleware.
- Use Starlette `BaseHTTPMiddleware` for complex middleware.
- Order: CORS → Auth → Logging → Error handling.
- Keep middleware stateless and fast.

## Anti-Patterns (Never Do)

- Never return SQLAlchemy models directly — always convert to Pydantic schemas.
- Never use `def` routes for I/O operations — they block worker threads.
- Never skip input validation — always use Pydantic models for request bodies.
- Never put business logic in route handlers — delegate to services.
- Never use `Optional` return types from routes — use proper HTTP status codes.
- Never create DB sessions manually in routes — use dependency injection.
- Never catch and silence exceptions in routes — let exception handlers deal with them.

## Performance

- Use connection pooling for databases (SQLAlchemy `pool_size`).
- Use `response_model_exclude_unset=True` to skip null fields in responses.
- Use `ORJSONResponse` for faster JSON serialization.
- Cache expensive computations with `aiocache` or Redis.
- Use streaming responses (`StreamingResponse`) for large data.
- Profile with `py-spy` or `yappi` for async code.

## Testing

- Use `httpx.AsyncClient` with `ASGITransport` for async testing.
- Override dependencies with `app.dependency_overrides` for mocking.
- Use `pytest-asyncio` for async test functions.
- Test each layer independently: schemas, services, routes.
- Use factory functions for test data creation.

```python
@pytest.fixture
def client(app: FastAPI, db_session: AsyncSession) -> AsyncGenerator:
    app.dependency_overrides[get_db] = lambda: db_session
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client

@pytest.mark.asyncio
async def test_create_user(client: AsyncClient) -> None:
    response = await client.post("/users", json={"email": "test@test.com", "name": "Test", "password": "secure123"})
    assert response.status_code == 201
    assert response.json()["email"] == "test@test.com"
```

## Security

- Use `OAuth2PasswordBearer` or custom schemes for authentication.
- Validate and sanitize all path/query parameters via Pydantic.
- Set CORS origins explicitly — never `allow_origins=["*"]` in production.
- Rate limit endpoints with `slowapi` or middleware.
- Use `Depends()` for authorization checks — never inline in route logic.
- Hash passwords with `passlib[bcrypt]` or `argon2`.
- Set response security headers via middleware.
