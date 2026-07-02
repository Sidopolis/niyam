# Supabase — Niyam Rules

## Core Principles

1. **Postgres is the foundation.** Supabase is a Postgres toolbox. Design for Postgres first, Supabase features second.
2. **RLS everywhere.** Every table with user data must have Row Level Security enabled and policies defined.
3. **Type safety from schema.** Generate TypeScript types from the database schema — never hand-write them.
4. **Edge-first for logic.** Put server logic in Edge Functions (Deno). Reserve database functions for data-intensive ops.
5. **Least privilege.** The `anon` key is public. Never trust it for authorization — that's what RLS is for.

## File Structure & Organization

```
supabase/
  config.toml             # Local development configuration
  migrations/             # SQL migration files
    20240101000000_init.sql
  functions/              # Edge Functions (Deno)
    hello/index.ts
  seed.sql                # Seed data
src/
  lib/supabase/
    client.ts             # Browser client
    server.ts             # Server client (SSR)
    admin.ts              # Service role client (server-only)
    types.ts              # Generated database types
```

- Generate types with `supabase gen types typescript --local > src/lib/supabase/types.ts`.
- Regenerate types after every migration.
- Never commit `.env` files with service role keys.

## Authentication

- Use Supabase Auth for all user management. Never build custom auth on top.
- Use `supabase.auth.getUser()` for server-side verification — never trust `getSession()` alone.
- Store user metadata in a separate `profiles` table linked by `auth.users.id`.
- Use database triggers to create profile rows on user signup.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Row Level Security (RLS)

- Enable RLS on every table: `ALTER TABLE posts ENABLE ROW LEVEL SECURITY;`
- Define separate policies for SELECT, INSERT, UPDATE, DELETE — never combine.
- Use `auth.uid()` to reference the current user in policies.
- Name policies descriptively: `users_can_read_own_data`, `admins_full_access`.
- Use `USING` for read checks, `WITH CHECK` for write checks.

```sql
CREATE POLICY "users_read_own_posts" ON posts
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "users_insert_own_posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);
```

## Realtime Subscriptions

- Subscribe only to the data you need — use filters to reduce payload.
- Always unsubscribe on component unmount or route change.
- Handle connection states: `SUBSCRIBED`, `TIMED_OUT`, `CLOSED`, `CHANNEL_ERROR`.
- Use Realtime for collaborative features, live dashboards — not for initial data loading.
- Combine with optimistic updates: update UI immediately, reconcile on server event.

```typescript
const channel = supabase
  .channel('posts-changes')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'posts', filter: `author_id=eq.${userId}` },
    (payload) => addPost(payload.new)
  )
  .subscribe();
return () => { supabase.removeChannel(channel); };
```

## Edge Functions

- Write Edge Functions in TypeScript (Deno runtime).
- Use for: webhooks, third-party API calls, complex validation, file processing.
- Access the database with the service role client inside functions.
- Validate all inputs with Zod or similar. Never trust request bodies.
- Set CORS headers explicitly. Return proper HTTP status codes.
- Keep functions small and focused — one responsibility per function.

## Storage

- Create buckets with clear naming: `avatars`, `documents`, `attachments`.
- Set RLS policies on storage buckets — they work the same as table policies.
- Use signed URLs for private files. Public buckets only for world-readable assets.
- Validate file types and sizes server-side before storing.
- Use image transformations via Supabase Image CDN instead of storing multiple sizes.

## Database Types & Queries

- Always pass the generated `Database` type to `createClient<Database>()` for full type inference.
- Use `.select('id, title, author:profiles(name)')` for typed joins.
- Use `.maybeSingle()` when a row may not exist. Use `.single()` when it must exist.
- Prefer database functions (RPC) for complex logic — they run in a single round-trip.

## Anti-Patterns (Never Do)

- Never disable RLS "temporarily" — it's always a security hole.
- Never use the `service_role` key on the client — it bypasses all RLS.
- Never trust `getSession()` on the server without calling `getUser()`.
- Never store files without bucket-level access policies.
- Never use Realtime as a data-fetching mechanism for initial page loads.
- Never hardcode Supabase URLs or keys — use environment variables.
- Never skip type generation after schema changes.

## Performance

- Use database indexes for columns used in RLS policies — unindexed policies are slow.
- Use `select()` to limit returned columns — never fetch `*` in production.
- Use connection pooling mode (port 6543) for serverless environments.
- Use `.range(from, to)` for pagination instead of fetching all rows.
- Batch related operations in database functions to reduce round-trips.

## Security

- Rotate keys if exposed. Service role key compromised = full database access.
- Enable MFA for admin users. Enforce strong passwords via Auth config.
- Use `SECURITY DEFINER` functions carefully — they run with elevated privileges.
- Audit RLS policies regularly. Test with different user roles.
- Use `supabase db lint` to catch common security issues.
