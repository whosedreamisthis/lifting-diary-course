# Data Fetching

## 1. Server components ONLY

> **ALL data fetching in this app MUST be done via server components.**
> This is incredibly important.

Data must **NOT** be fetched via:

- Route handlers (`app/**/route.ts`)
- Client components (`"use client"`), including `useEffect`, SWR, React Query, or `fetch` from the browser
- Any other mechanism

The only allowed way to read data is: a **server component** calls a **helper function in `/data`**, which queries the database with **Drizzle ORM**.

```tsx
// app/dashboard/page.tsx (server component — no "use client")
import { getWorkoutsForDate } from "@/data/workouts";

export default async function DashboardPage() {
  // No userId passed in — the helper resolves it from the session itself.
  const workouts = await getWorkoutsForDate(new Date());
  return <WorkoutList workouts={workouts} />;
}
```

If a client component needs data, fetch it in a parent server component and pass it down as props.

## 2. Database queries live in `/data` helpers

- All database queries MUST be written as helper functions in the `/data` directory (e.g. `data/workouts.ts`, `data/exercises.ts`).
- Server components import these helpers; they never import `db` directly or build queries inline.
- Helpers MUST use **Drizzle ORM** (`db` from `@/db`, tables from `@/db/schema`).
- **DO NOT USE RAW SQL.** No `db.execute(sql\`...\`)` for whole queries, no string-built queries. Use the Drizzle query builder / relational queries and operators (`eq`, `and`, `gte`, ...).

## 3. Users may ONLY access their own data

This is incredibly important. A logged-in user must never be able to read any data other than their own.

- Every helper in `/data` MUST scope its query to the current user's Clerk `userId`.
- Get the `userId` from Clerk's `auth()` on the server. NEVER accept a user ID from the client, URL, search params, or form input as the source of identity.
- Helpers MUST resolve the user themselves by calling Clerk's `auth()` inside the helper, and MUST NOT take `userId` as a parameter. A helper that accepts a caller-supplied `userId` can be handed someone else's ID by mistake, so the session is the only source of identity. Always include the session `userId` in the `where` clause.
- Put the shared check in one function (`requireUserId()` in `data/auth.ts`) and call it at the top of every helper.
- When fetching a single record by ID (e.g. a workout), ALWAYS filter by both the record ID **and** `userId`. An ID alone is never enough.
- If there is no authenticated user, throw / redirect — never return unscoped data.

### Tables without a `user_id` column

Only `exercises` and `workouts` have a `user_id` column. `workout_exercises` and `sets` do not, so ownership must be enforced through the parent `workouts` row:

- `workout_exercises` → check via `workouts.userId` (through `workoutId`)
- `sets` → check via `workoutExercises` → `workouts.userId`

Always filter on the owning `workouts.userId` when querying these tables (via a join or relational `where`), so a user can never reach another user's rows by guessing IDs.

### Example helper

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

```ts
// data/workouts.ts
import { db } from "@/db";
import { requireUserId } from "@/data/auth";

export async function getWorkoutsForDate(date: Date) {
  const userId = await requireUserId(); // session user, never a parameter

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return db.query.workouts.findMany({
    where: {
      userId, // always scope to the current user
      startedAt: { gte: start, lt: end },
    },
    with: { workoutExercises: { with: { exercise: true, sets: true } } },
  });
}

export async function getWorkoutById(workoutId: number) {
  const userId = await requireUserId();

  return db.query.workouts.findFirst({
    where: { id: workoutId, userId }, // ID AND userId, never ID alone
  });
}
```

## Checklist

- [ ] Data is fetched in a server component, not a route handler or client component
- [ ] Query lives in a `/data` helper
- [ ] Helper uses Drizzle ORM — no raw SQL
- [ ] Helper gets `userId` from the session via `requireUserId()` (no `userId` parameter)
- [ ] Query is scoped to that session `userId`
- [ ] Child tables (`workout_exercises`, `sets`) are checked through `workouts.userId`
