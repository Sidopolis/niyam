# shadcn/ui — Niyam Rules

## Core Principles

1. **Copy, don't install.** shadcn/ui is not a package — components are copied into your project. You own them.
2. **Radix primitives underneath.** Components are built on Radix UI. Understand the primitive to customize the component.
3. **Tailwind for styling.** All styling uses Tailwind CSS utility classes. No separate CSS files per component.
4. **Composable by design.** Combine primitives to build complex UI. Avoid monolithic components.
5. **Accessible by default.** Radix handles ARIA, keyboard, focus management. Don't override without reason.

## File Structure & Organization

```
src/
  components/
    ui/                   # shadcn/ui base components (generated)
      button.tsx
      dialog.tsx
      form.tsx
    app/                  # App-specific composed components
      user-nav.tsx
      data-table.tsx
  lib/
    utils.ts              # cn() utility and helpers
components.json           # shadcn/ui configuration
```

- Keep `components/ui/` for generated shadcn components. Customize in place — they're yours.
- Put app-specific compositions in a separate directory to distinguish base from composed.
- Never modify `lib/utils.ts` beyond adding utilities — `cn()` must remain intact.

## Installation & Configuration

- Initialize with `npx shadcn@latest init`. Choose your style, colors, and CSS variables.
- Add components individually: `npx shadcn@latest add button dialog form`.
- Use `components.json` to configure paths, style preferences, and aliases.
- Keep `components.json` in version control — it's the source of truth for component generation.
- When updating components, re-run add and merge changes with your customizations.

## Customization & Theming

- Use CSS custom properties (defined in `globals.css`) for theming. Not Tailwind config colors directly.
- Define light/dark themes via HSL variables in `:root` and `.dark` selectors.
- Extend the theme by adding new CSS variables — don't modify the base shadcn variable names.
- Use the `cn()` utility (clsx + tailwind-merge) for conditional class composition.

```typescript
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-lg border bg-card p-6", className)} {...props} />;
}
```

- Override component styles by passing `className` — not by editing the base component for one-off cases.
- For global style changes (all buttons should be rounded-full), modify the base component.

## Variants & Class Variance Authority

- Use `cva` (class-variance-authority) for component variants. It's the standard pattern.
- Define variants as explicit types — not string unions.
- Combine variants with `compoundVariants` for state combinations.
- Export the variant types for consumers to use in props.

```typescript
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: { default: "bg-primary text-primary-foreground hover:bg-primary/90", destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90", outline: "border border-input bg-background hover:bg-accent" },
      size: { default: "h-10 px-4 py-2", sm: "h-9 px-3", lg: "h-11 px-8", icon: "h-10 w-10" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
```

## Compound Components

- Build complex UI by composing multiple shadcn primitives together.
- Use Radix's compound component pattern: `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`.
- Create app-level compound components that wrap shadcn primitives with business logic.
- Pass `asChild` to Radix slots when you need to render a different element (e.g., Link as Button).

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Edit Profile</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>Make changes to your profile.</DialogDescription>
    </DialogHeader>
    <ProfileForm />
  </DialogContent>
</Dialog>
```

## Accessibility

- Never remove Radix's built-in keyboard handlers or ARIA attributes.
- Always provide `DialogTitle` and `DialogDescription` for dialogs (required by screen readers).
- Use `VisuallyHidden` for labels that shouldn't be visible but must exist for accessibility.
- Test keyboard navigation: Tab, Escape, Enter, Space, Arrow keys must work per component type.
- Use `aria-label` on icon-only buttons. Provide descriptive labels for all form controls.
- Ensure color contrast meets WCAG 2.1 AA standards in both light and dark themes.

## Forms

- Use `react-hook-form` + `zod` with shadcn's `<Form>` component for validated forms.
- Use `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormMessage>` for consistent structure.
- Always show validation errors adjacent to the field, not in a toast or alert.
- Use `<FormDescription>` for helper text below fields.

## Anti-Patterns (Never Do)

- Never install shadcn/ui as an npm package — it's a CLI that copies source files.
- Never override Radix's accessibility primitives (focus trap, keyboard handlers) without reason.
- Never use inline styles on shadcn components — use Tailwind classes and `cn()`.
- Never create deeply nested variant trees — flatten with compound variants.
- Never ignore the `asChild` pattern — cloning props onto children is fragile.
- Never mix CSS modules or styled-components with shadcn's Tailwind approach.
- Never put business logic inside `components/ui/` — keep base components pure.

## Performance

- Import components directly, not from a barrel file: `import { Button } from "@/components/ui/button"`.
- Use dynamic imports for heavy components (DataTable, Charts) below the fold.
- Use `React.memo` only for components in lists that receive stable props.
- Avoid wrapping every component in `forwardRef` unless it needs ref forwarding.
- Use `Suspense` boundaries around async content within dialogs and sheets.

## Testing

- Test composed behavior, not shadcn internals. Radix is tested upstream.
- Use Testing Library queries: `getByRole('button')`, `getByRole('dialog')`.
- Test keyboard interactions: open/close dialogs, navigate dropdowns, submit forms.
- Test with screen readers (VoiceOver, NVDA) for critical flows.
