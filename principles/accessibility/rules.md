# Accessibility — Niyam Rules

## Philosophy

Accessibility is not an enhancement — it is a requirement. If a user cannot perceive, operate,
or understand the interface, the feature is broken, not incomplete.
Based on WCAG 2.2 Level AA. Design for the full spectrum of human ability.

## Core Rules

### Semantic HTML

1. Use the correct HTML element for its purpose. `<button>` for actions, `<a>` for navigation.
2. Heading hierarchy is meaningful: `h1` > `h2` > `h3`. Never skip levels for styling.
3. Use `<nav>`, `<main>`, `<article>`, `<aside>`, `<header>`, `<footer>` landmark elements.
4. Lists use `<ul>`/`<ol>`. Tables use `<table>` with `<thead>`, `<th scope>`.
5. Form inputs have associated `<label>` elements (explicit `for`/`id` or wrapping).
6. Never use `<div>` or `<span>` for interactive elements. They lack keyboard and AT support.

### ARIA (When Needed)

7. First rule of ARIA: don't use ARIA if native HTML provides the semantics.
8. If you must use ARIA: `role`, `aria-label`, `aria-describedby`, `aria-live`, `aria-expanded`.
9. Custom widgets require complete ARIA: role + states + keyboard interaction pattern.
10. `aria-live="polite"` for dynamic content updates (notifications, loading states).
11. `aria-hidden="true"` for decorative elements that should be hidden from screen readers.
12. Never use `role="presentation"` on focusable elements.
13. Test ARIA with actual screen readers. Invalid ARIA is worse than no ARIA.

### Keyboard Navigation

14. Every interactive element is reachable and operable with keyboard alone.
15. Tab order follows visual/logical reading order. Never use `tabindex > 0`.
16. Custom components implement expected keyboard patterns (Enter, Space, Escape, Arrows).
17. No keyboard traps. Users can always Tab out of a component (except modal dialogs).
18. Skip links: provide "Skip to main content" as the first focusable element.
19. Escape closes modals, dropdowns, and overlays. Focus returns to the trigger.

### Focus Management

20. Focus is always visible. Custom focus styles with minimum 3:1 contrast against adjacent colors.
21. Never `outline: none` without a visible replacement.
22. When content changes dynamically (modals, page transitions), move focus appropriately.
23. After modal close: return focus to the element that triggered it.
24. After item deletion: move focus to the next logical item or a summary.
25. Focus indicators have minimum 2px thickness or equivalent visibility.

### Color and Contrast

26. Text contrast: 4.5:1 minimum for normal text, 3:1 for large text (18px+ or 14px+ bold).
27. UI component contrast: 3:1 against adjacent colors for boundaries and states.
28. Never convey information through color alone. Use icons, patterns, or text alongside.
29. Test with color blindness simulators (protanopia, deuteranopia, tritanopia).
30. Dark mode: maintain contrast ratios. Don't just invert — redesign for readability.

### Screen Readers

31. Images: meaningful images get descriptive `alt`. Decorative images get `alt=""`.
32. Icons: icon-only buttons need `aria-label`. Text + icon: hide icon from AT.
33. Error messages: associate with inputs via `aria-describedby`. Announce dynamically.
34. Loading states: announce with `aria-live`. Indicate progress where possible.
35. Abbreviations and acronyms: expand on first use or use `<abbr title>`.

### Motion and Animation

36. Respect `prefers-reduced-motion`. Disable non-essential animations when set.
37. No content that flashes more than 3 times per second (seizure risk).
38. Auto-playing media: provide pause/stop controls. Never auto-play with audio.
39. Parallax and motion effects: provide static alternatives.
40. Transitions for state changes are acceptable; decorative loops are not essential.

### Forms and Errors

41. Group related fields with `<fieldset>` and `<legend>`.
42. Error messages are specific: "Email must include @" not "Invalid input".
43. Errors appear adjacent to the field AND in a summary at the top.
44. Required fields: indicate visually AND programmatically (`aria-required` or `required`).
45. Don't clear form fields on validation error. Preserve user input.

## Implementation Guidelines

- Test with keyboard only: unplug the mouse and complete every flow.
- Test with screen reader: NVDA (Windows), VoiceOver (macOS/iOS), TalkBack (Android).
- Automated testing: axe-core in unit tests, Lighthouse in CI (score > 90).
- Manual testing: no automated tool catches all issues. Schedule regular audits.
- Use browser devtools accessibility inspector to verify computed roles and names.
- Document component keyboard interaction patterns in a component library.

## Anti-Patterns

- **Div Soup**: `<div onclick>` instead of `<button>`. Use semantic elements.
- **Missing Labels**: inputs without associated labels. Screen readers can't identify them.
- **Color-Only Information**: red text for errors with no icon or text indicator.
- **Keyboard Traps**: focus enters a widget and can't leave. Always provide escape.
- **Auto-Playing Content**: video/audio/carousels that move without user consent.
- **ARIA Overuse**: adding roles to elements that already have correct semantics.
- **Invisible Focus**: removing outline without providing alternative focus styles.
- **Inaccessible Modals**: no focus trap inside modal, no escape to close, no focus return.
- **Time Limits**: sessions that expire without warning or extension option.

## Verification

- [ ] All interactive elements are keyboard accessible and operable
- [ ] Heading hierarchy is logical and sequential (no skipped levels)
- [ ] All images have appropriate alt text (descriptive or empty for decorative)
- [ ] Color contrast meets WCAG 2.2 AA minimums (4.5:1 text, 3:1 UI)
- [ ] Focus is always visible with sufficient contrast
- [ ] Forms have associated labels, clear error messages, and field grouping
- [ ] Dynamic content changes are announced to screen readers
- [ ] `prefers-reduced-motion` is respected for non-essential animations
- [ ] axe-core / Lighthouse accessibility score > 90 in CI
- [ ] Manual screen reader testing completed for key user flows
