# Flutter 3+ — Niyam Rules

## Core Principles

1. **Everything is a widget.** Compose small, focused widgets into complex UIs.
2. **Immutable widgets, mutable state.** Widgets describe UI; state drives rebuilds.
3. **Declarative UI.** Describe what the UI should look like for a given state, not how to transition.
4. **Platform-adaptive.** Respect platform conventions while sharing business logic.
5. **Const everywhere.** Use `const` constructors to prevent unnecessary rebuilds.

## File Structure & Organization

```
lib/
  main.dart
  app.dart                # MaterialApp/CupertinoApp setup
  core/
    constants.dart
    extensions.dart
    exceptions.dart
  features/
    auth/
      data/
        auth_repository.dart
        auth_remote_source.dart
      domain/
        user_model.dart
      presentation/
        login_screen.dart
        widgets/
          login_form.dart
  shared/
    widgets/
      app_button.dart
    providers/             # or blocs/
test/
  features/
    auth/
      login_screen_test.dart
```

- Group by feature using a layered architecture (data/domain/presentation).
- One widget per file for non-trivial widgets. Small private helpers are fine inline.
- File names are `snake_case.dart`. Class names are `PascalCase`.
- Keep `main.dart` minimal — just `runApp()` and top-level provider setup.

## Patterns & Best Practices

### Widget Composition
- Prefer composition over inheritance. Never extend `StatelessWidget` to add behavior.
- Extract widgets when a `build` method exceeds ~50 lines.
- Use `Builder` widgets for context-dependent logic (e.g., `LayoutBuilder`).
- Pass callbacks down for child-to-parent communication.

### State Management (Riverpod)
- Use `@riverpod` annotation (riverpod_generator) for providers.
- Use `ref.watch()` for reactive dependencies in build methods.
- Use `ref.read()` for one-time reads in callbacks.
- Use `AsyncNotifier` for state that involves async operations.
- Keep providers focused — one provider per concern.

### State Management (Bloc)
- One Bloc per feature/screen. Events in, states out.
- States are sealed classes. Use pattern matching for UI rendering.
- Never emit state from outside the Bloc.
- Use `BlocListener` for side effects (navigation, snackbars).
- Use `BlocSelector` for fine-grained rebuilds.

### Navigation (go_router)
- Define routes declaratively in a single router configuration.
- Use path parameters for resource identifiers.
- Use `extra` sparingly — prefer serializable route params.
- Handle deep linking and redirect logic in router configuration.

### Platform Channels
- Define a clear Dart interface for platform-specific code.
- Use `MethodChannel` for simple calls. Use `EventChannel` for streams.
- Handle `MissingPluginException` gracefully for unsupported platforms.
- Use Pigeon for type-safe platform channel code generation.

## Anti-Patterns (Never Do)

- Never use `setState` in a `StatelessWidget` hierarchy — use proper state management.
- Never put business logic in widgets. Separate concerns.
- Never use `MediaQuery.of(context)` directly in deeply nested widgets — pass values down.
- Never use `BuildContext` across async gaps without checking `mounted`.
- Never use mutable global variables for state.
- Never ignore `dispose()` — always clean up controllers, streams, subscriptions.
- Never use `dynamic` when a concrete type is available.

## Performance

- Mark widgets `const` wherever possible to skip rebuilds.
- Use `RepaintBoundary` to isolate expensive paint operations.
- Use `ListView.builder` / `GridView.builder` for long lists (lazy rendering).
- Use `AutomaticKeepAliveClientMixin` sparingly for tab preservation.
- Avoid `Opacity` widget for hiding — use `Visibility` or conditional rendering.
- Profile with DevTools: look at rebuild counts, jank, and memory.
- Use `compute()` or `Isolate` for expensive synchronous operations.
- Cache images with `CachedNetworkImage` or precaching.

## Testing

- Unit tests for business logic, repositories, and state management.
- Widget tests for UI components with `testWidgets`.
- Integration tests with `integration_test` package for full flows.
- Use `mockito` or `mocktail` for mocking dependencies.
- Use `pumpWidget` and `pump()` for triggering rebuilds in widget tests.
- Test golden files for visual regression (`matchesGoldenFile`).

```dart
testWidgets('login button triggers auth', (tester) async {
  final mockAuth = MockAuthRepository();
  when(() => mockAuth.login(any(), any())).thenAnswer((_) async => user);

  await tester.pumpWidget(
    ProviderScope(
      overrides: [authRepoProvider.overrideWithValue(mockAuth)],
      child: const MaterialApp(home: LoginScreen()),
    ),
  );

  await tester.enterText(find.byKey(const Key('email')), 'test@test.com');
  await tester.enterText(find.byKey(const Key('password')), 'pass123');
  await tester.tap(find.byType(ElevatedButton));
  await tester.pumpAndSettle();

  verify(() => mockAuth.login('test@test.com', 'pass123')).called(1);
});
```

## Security

- Never store sensitive data in SharedPreferences — use `flutter_secure_storage`.
- Validate all API responses before parsing.
- Use certificate pinning for sensitive API communication.
- Obfuscate release builds with `--obfuscate --split-debug-info`.
- Never hardcode API keys in source — use compile-time env vars (`--dart-define`).
- Sanitize user input before displaying (prevent injection in WebViews).
