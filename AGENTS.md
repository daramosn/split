# SplitUp Svelte - Agent Guidance

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
- **Database**: Supabase (PostgreSQL) — all data persisted remotely
- **Auth**: Google OAuth via Supabase Auth
- **Validation**: Zod for server action input validation
- **Styling**: CSS custom properties with light/dark theme support

## Environment Setup

Required env vars in `.env.local`:
```
PUBLIC_SUPABASE_URL=<supabase-project-url>
PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
PUBLIC_APP_URL=http://localhost:5173
```

`PUBLIC_APP_URL` must match the current environment — `localhost:5173` for dev, production domain for prod. Used for OAuth redirect.

## Project Structure

```
src/
├── lib/
│   ├── types.ts              # Core TypeScript interfaces (Group, Expense, Participant)
│   ├── utils/
│   │   └── balances.ts       # Client-safe balance calculation (shared by server + client)
│   ├── components/
│   │   ├── icons/            # 20 icon components (IconPlus, IconUsers, etc.)
│   │   └── Toast.svelte      # Toast notification component
│   ├── stores/
│   │   └── toast.svelte.ts   # Toast store (Svelte 5 runes)
│   ├── server/
│   │   ├── store.ts          # Supabase data access layer
│   │   └── schemas.ts        # Zod validation schemas
│   └── supabase/
│       ├── client.ts         # Browser Supabase client
│       ├── server.ts         # Server Supabase client
│       └── auth.ts           # Auth helper functions
├── hooks.server.ts           # Auth middleware + Supabase client setup
├── routes/
│   ├── +layout.svelte        # Root layout with theme toggle, auth, toast
│   ├── +layout.server.ts     # Session data for layout
│   ├── +page.svelte          # Home: list groups (streamed)
│   ├── +page.server.ts       # Home: load groups
│   ├── create/               # Create group page
│   ├── group/[id]/           # Group dashboard (streamed balances/transactions)
│   ├── auth/callback/        # OAuth callback handler
│   └── api/join/             # API endpoint to join by invite code
├── app.css                   # Global styles + theme tokens + skeleton animations
└── app.d.ts                  # App.Locals type declarations
```

## Important Patterns

### Server Actions
- Use `+page.server.ts` files with named actions for form submissions
- Validate with Zod schemas from `$lib/server/schemas.ts`
- Return `{ success: true }` or `{ error: 'message' }`
- Actions re-fetch the group for auth checks — use `group.ownerId === userId` (in-memory), NOT `isGroupOwner()` query

### Auth Flow
- `hooks.server.ts` creates Supabase client + attaches `getUser()` to `event.locals`
- `getUser()` is cached per request — safe to call multiple times
- `+layout.server.ts` passes session to all pages via `data.session`
- OAuth callback at `/auth/callback` exchanges code for session, redirects to cookie-stored URL

### Svelte 5 Runes
- Use `$state()` for reactive variables, NOT plain `let`
- Use `$props()` with destructuring for component props
- Use `$derived()` for computed values
- Use `onclick` NOT `on:click` for event handlers
- Use `{@render}` with snippets instead of slots
- **Deep mutation gotcha**: `$props()` data is not deeply reactive. Use local `$state` copies for arrays/objects that change (see `group/[id]/+page.svelte` for pattern)

### Streaming & Skeletons
- Home page streams `groups` as a promise (don't await in load)
- Group page streams `balances` and `transactions` as promises
- Templates use `{#await}` with skeleton placeholders from `app.css`

### Optimistic UI
- `group/[id]/+page.svelte` uses `use:enhance` for add expense, delete expense, add member
- Local `$state` copies (`expenses`, `participants`) drive the UI
- On success: `await update()` replaces with server data
- On error: rollback + `addToast('message', 'error')`
- Toast component in `+layout.svelte`

### Icons
- All icons in `src/lib/components/icons/` as individual `.svelte` files
- Import from `$lib/components/icons` (barrel export in `index.ts`)
- Accept `size`, `strokeWidth`, `class` props with sensible defaults

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
  splitParts?: Record<string, number>;
  splitAmounts?: Record<string, number>;
  date: string;
}
```

## Known Constraints

- **Supabase required**: App won't work without valid Supabase credentials
- **Google OAuth only**: Auth requires Google provider configured in Supabase dashboard
- **Redirect URLs**: Supabase dashboard must whitelist both localhost and production callback URLs
- **A11y warnings**: Unused CSS selectors may appear in svelte-check (harmless)

## Before Submitting Changes
1. Run `pnpm check` — must pass with 0 errors
2. Ensure form radio groups use `<fieldset>` + `<legend>`
3. Use Zod validation for any new form inputs in server actions

## Commit & Push Rules
- **Always ask before committing** — show what will be committed and get approval first
- **Never push unless explicitly asked** — `git push` only when the user says to push
