# Tricount Svelte - Agent Guidance

## Quick Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm check        # TypeScript + Svelte type checking (run before commits)
```

## Tech Stack
- **Framework**: SvelteKit 2.x + Svelte 5 (runes: `$state`, `$derived`, `$effect`, `$props`)
- **Language**: TypeScript (strict)
- **Package Manager**: pnpm (strictly enforced via `packageManager` field)
- **Validation**: Zod for server action input validation
- **Styling**: CSS custom properties with light/dark theme support

## Project Structure

```
src/
├── lib/
│   ├── types.ts           # Core TypeScript interfaces (Group, Expense, Participant)
│   └── server/
│       ├── store.ts       # In-memory data store (Map-based, not persisted)
│       └── schemas.ts     # Zod validation schemas
├── routes/
│   ├── +layout.svelte     # Root layout with theme toggle + skip link
│   ├── +page.svelte       # Home: list groups
│   ├── create/            # Create group page
│   ├── group/[id]/        # Group dashboard (expenses, balances, settlements)
│   └── api/join/         # API endpoint to join by group ID
├── app.css                # Global styles + theme tokens
└── service-worker.ts      # PWA offline support
```

## Important Patterns

### Server Actions
- Use `+page.server.ts` files with named actions for form submissions
- Validate with Zod schemas from `$lib/server/schemas.ts`
- Return `{ success: true }` or `{ error: 'message' }`

### Svelte 5 Runes
- Use `$state()` for reactive variables, NOT plain `let`
- Use `$props()` with destructuring for component props
- Use `$derived()` for computed values
- Use `onclick` NOT `on:click` for event handlers
- Use `{@render}` with snippets instead of slots

### Accessibility
- Always wrap radio/checkbox groups in `<fieldset>` with `<legend>`
- Theme toggle button already has `aria-label`
- Layout includes skip link for keyboard users

## Data Model

```typescript
// Key types in src/lib/types.ts
interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;          // participant ID
  splitBetween: string[]; // participant IDs
  splitMode: 'equal' | 'parts' | 'amount';
  splitParts?: Record<string, number>;   // for 'parts' mode
  splitAmounts?: Record<string, number>;  // for 'amount' mode
  date: string;
}
```

## Known Constraints

- **No database**: In-memory store resets on server restart
- **No auth**: Anyone with group ID can access
- **Node types warning**: `tsconfig.json` will show node type warning (harmless)
- **A11y warnings**: Unused CSS selectors may appear in svelte-check

## Skills Installed
- `svelte5-best-practices` - Svelte 5 runes, snippets, SvelteKit patterns
- `accessibility` - WCAG 2.2 guidelines
- `nodejs-best-practices` - Backend patterns
- `vite` - Build configuration

## Before Submitting Changes
1. Run `pnpm check` - must pass with 0 errors
2. Ensure form radio groups use `<fieldset>` + `<legend>`
3. Use Zod validation for any new form inputs in server actions