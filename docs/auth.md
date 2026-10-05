# Authentication

## 1. Clerk is the ONLY auth provider

> **ALL authentication in this app MUST be handled by [Clerk](https://clerk.com).**
> This is incredibly important.

- Use the `@clerk/nextjs` package (`@clerk/nextjs` for components, `@clerk/nextjs/server` for server APIs).
- **DO NOT** build custom auth: no hand-rolled login forms, password handling, session cookies, JWTs, or any other auth library (NextAuth/Auth.js, Better Auth, Neon Auth, etc.).
- **DO NOT** create a local `users` table. Clerk owns user identity; `user_id` columns in our tables store the Clerk user ID (see `db/schema.ts`).
- Before writing Clerk code, check the current Clerk docs (via Context7) — the API changes between versions (e.g. this app uses `<Show when="signed-in">`, not the older `<SignedIn>` / `<SignedOut>`).

## 2. Setup (already in place — do not duplicate)

| Concern | Where | What it does |
| --- | --- | --- |
| Provider | `app/layout.tsx` | `<ClerkProvider>` wraps the whole app, including the header with sign-in / sign-up / `<UserButton />` |
| Middleware | `proxy.ts` | `clerkMiddleware()` runs on every request and protects routes |
| Sign-in page | `app/sign-in/[[...sign-in]]/page.tsx` | Renders Clerk's `<SignIn />` |
| Sign-up page | `app/sign-up/[[...sign-up]]/page.tsx` | Renders Clerk's `<SignUp />` |
| Session helper | `data/auth.ts` | `requireUserId()` — the single way to get the current user in server code |

Note: Next.js 16 uses `proxy.ts` (not `middleware.ts`) at the repo root. Do not add a `middleware.ts`.

Clerk keys live in `.env.local` (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`). NEVER commit them or hard-code them.

## 3. Protecting routes

Routes are protected in **`proxy.ts`** with `createRouteMatcher` + `auth.protect()`:

```ts
// proxy.ts
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});
```

- Any new page that requires a signed-in user MUST be added to `isProtectedRoute`. `/dashboard` and everything under it is protected today.
- Public pages (home, `/sign-in`, `/sign-up`) stay out of the matcher.
- Middleware protection is the first line of defense, NOT the only one: server code that touches user data must still verify the session itself (section 4).

## 4. Getting the current user (server side)

- Get the user ID on the server with `requireUserId()` from `@/data/auth`, which wraps Clerk's `auth()`:

```ts
// data/auth.ts
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Returns the session user's ID; sends signed-out visitors to sign-in.
export async function requireUserId() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}
```

- `auth()` is **async** — always `await` it.
- Call `requireUserId()` at the top of every `/data` helper and every Server Action. Never skip it because "the middleware already protects this page".
- NEVER take a user ID from the client, URL, search params, or form input as the source of identity. The Clerk session is the only source. See `docs/data-fetching.md` for how this applies to queries.
- Import `auth` directly from `@clerk/nextjs/server` only inside `data/auth.ts`. Everything else goes through `requireUserId()` so there is one place to change auth behavior.
- If you need more than the ID (name, email, avatar), use Clerk's `currentUser()` from `@clerk/nextjs/server` in a server component — do not copy that data into our database.

## 5. Auth UI (client side)

- Use Clerk's prebuilt components: `<SignIn />`, `<SignUp />`, `<SignInButton>`, `<SignUpButton>`, `<UserButton />`.
- Conditionally render based on auth state with `<Show when="signed-in">` / `<Show when="signed-out">`.
- Sign-in and sign-up buttons open Clerk in `mode="modal"`.
- UI that merely **hides** something from signed-out users is cosmetic. Real access control happens on the server (sections 3 and 4).
- Client hooks (`useUser`, `useAuth`) may be used for display purposes only. NEVER use them to decide what data a user may access, and NEVER fetch data from the client (see `docs/data-fetching.md`).
- Style Clerk components to match the app per `docs/ui.md`; customize through Clerk's `appearance` prop rather than overriding its CSS.

## 6. Redirects

- Signed-out users hitting a protected page are sent to `/sign-in` (by `auth.protect()` and by `requireUserId()`).
- Keep sign-in/sign-up pages as optional catch-all routes (`[[...sign-in]]`) — Clerk needs the sub-paths for multi-step flows.

## Checklist

- [ ] Auth is done with Clerk only — no custom auth, no other auth library
- [ ] New protected routes are added to `isProtectedRoute` in `proxy.ts`
- [ ] Server code gets the user via `requireUserId()` (which wraps `await auth()`)
- [ ] User identity never comes from the client, URL, or form input
- [ ] No local `users` table; `user_id` columns hold the Clerk user ID
- [ ] Clerk keys are in `.env.local`, not in code
- [ ] Clerk API usage was checked against current docs (this is a recent Clerk version)
