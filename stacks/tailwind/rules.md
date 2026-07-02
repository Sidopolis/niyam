# Tailwind CSS 4+ — Niyam Rules

## Core Principles

1. **Utility-first.** Style with utility classes directly in markup. Extract components, not CSS.
2. **Design tokens over magic numbers.** Use the theme scale for spacing, colors, typography.
3. **Responsive by default.** Mobile-first design with breakpoint prefixes.
4. **Consistency through constraint.** The design system limits choices, which improves UI coherence.
5. **No custom CSS unless unavoidable.** If Tailwind has a utility, use it.

## File Structure & Organization

```
project/
  tailwind.config.ts    # v3 / CSS-based config in v4
  app.css               # @import "tailwindcss"; + custom layers
  components/
    Button.tsx          # Component with utility classes
  styles/
    tokens.css          # Design token overrides (v4: @theme)
```

- In Tailwind v4, configuration is CSS-native with `@theme` directive.
- Define design tokens (colors, spacing, fonts) in theme configuration.
- No separate utility CSS files — styles live in component markup.
- Use CSS `@layer` for rare custom utilities or base styles.

## Patterns & Best Practices

### Design Tokens (v4)
```css
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.6 0.2 250);
  --color-secondary: oklch(0.7 0.15 180);
  --font-sans: "Inter", sans-serif;
  --spacing-page: 2rem;
}
```

### Responsive Design
- Mobile-first: base styles apply to all screens, add `sm:`, `md:`, `lg:`, `xl:` for larger.
- Use container queries (`@container`) for component-level responsiveness.
- Avoid fixed widths. Use `max-w-*`, `min-w-*`, and flex/grid utilities.

### Dark Mode
- Use `dark:` variant with class-based toggling (`darkMode: 'class'`).
- Define semantic color tokens that switch in dark mode.
- Test both modes. Never hardcode colors that break in the other mode.

### Component Extraction
- Extract repeated utility patterns into components (React, Vue, Svelte), not CSS classes.
- Use `@apply` only in rare cases (e.g., styling third-party HTML you can't modify).
- When you must use `@apply`, keep it in a component-scoped style block.
- Use `clsx` or `cn` (tailwind-merge) for conditional class composition.

```tsx
function Button({ variant = 'primary', children }: ButtonProps) {
  return (
    <button className={cn(
      'rounded-lg px-4 py-2 font-medium transition-colors',
      variant === 'primary' && 'bg-primary text-white hover:bg-primary/90',
      variant === 'secondary' && 'bg-secondary text-gray-900 hover:bg-secondary/90',
    )}>
      {children}
    </button>
  );
}
```

### Arbitrary Values
- Use `[value]` syntax for one-off values: `w-[327px]`, `text-[#1a1a1a]`.
- Prefer theme values over arbitrary values. Arbitrary = design system violation.
- If using an arbitrary value more than twice, add it to the theme.

### Plugins
- Use official plugins: `@tailwindcss/typography`, `@tailwindcss/forms`, `@tailwindcss/container-queries`.
- Create custom plugins for project-specific utilities that repeat everywhere.
- Define custom variants in plugins for complex state selectors.

## Anti-Patterns (Never Do)

- Never write custom CSS for things Tailwind already handles.
- Never use `@apply` to recreate component abstractions — use actual components.
- Never use arbitrary values for theme-defined scales (e.g., `p-[16px]` when `p-4` exists).
- Never mix Tailwind utilities with manual CSS `style` attributes for the same property.
- Never nest utility classes in CSS files — defeats the purpose of utility-first.
- Never use `!important` utilities (`!`) except to override third-party styles.
- Never create a `utilities.css` file full of `@apply` rules — that's just writing CSS with extra steps.

## Performance

- Use PurgeCSS (automatic in Tailwind) — ensure `content` paths cover all template files.
- Prefer Tailwind's built-in transitions over custom CSS animations.
- Use `will-change-*` utilities sparingly and only for proven jank.
- Avoid overly long class strings — extract components when classes exceed ~10 utilities.
- Use `@layer utilities` for custom utilities to ensure proper purging.

## Testing

- Visual regression tests with Playwright or Chromatic for component appearance.
- Test responsive layouts at each breakpoint.
- Test dark mode toggling.
- Verify accessibility: color contrast ratios, focus indicators, touch targets.
- Use browser DevTools to inspect computed styles match intent.

## Security

- Never use arbitrary values with user-generated content (injection risk in class names).
- Sanitize any dynamic class names constructed from user input.
- Use CSP headers that allow inline styles if using Tailwind's runtime (JIT in dev).
- Ensure `content` configuration doesn't scan user-uploaded files.
