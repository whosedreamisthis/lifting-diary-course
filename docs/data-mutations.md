# Data Mutations

## 1. Mutations go through `/data` helpers (Drizzle ORM)

> **ALL database writes (insert, update, delete) in this app MUST be done via helper functions in the `/data` directory that wrap Drizzle ORM calls.**
> This is incredibly important.

- Mutation helpers live next to the read helpers in `/data` (e.g. `data/workouts.ts`, `data/exercises.ts`).
- Helpers MUST use **Drizzle ORM** (`db` from `@/db`, tables from `@/db/schema`) with `insert`, `update`, `delete` and operators like `eq` / `and`.
- **DO NOT USE RAW SQL.** No `db.execute(sql\`...\`)` for whole statements, no string-built queries.
- Server actions, components, and route handlers NEVER import `db` directly or write queries inline. They call a `/data` helper.
- Helpers are plain async functions that do one thing. They contain no validation of user input (that is the server action's job, section 4) and no `revalidatePath` / `redirect` calls (also the action's job).

### Mutations must be scoped to the current user

The same rules as `docs/data-fetching.md` and `docs/auth.md` apply to writes, and the stakes are higher:

- Every helper MUST call `requireUserId()` (from `@/data/auth`) itself and MUST NOT take `userId` as a parameter.
- On insert, set `userId` from the session — never from caller input.
- On update and delete, ALWAYS filter by the record ID **and** `userId`. An ID alone is never enough.
- `workout_exercises` and `sets` have no `user_id` column. Before writing to them, verify ownership through the parent `workouts.userId` (e.g. confirm the workout belongs to the user first, or filter through a join / subquery). Never trust a `workoutId` or `workoutExerciseId` just because it was passed in.

```ts
// data/workouts.ts
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { requireUserId } from "@/data/auth";

export async function createWorkout(input: { name?: string; startedAt: Date }) {
  const userId = await requireUserId(); // session user, never a parameter

  const [workout] = await db
    .insert(workouts)
    .values({ userId, name: input.name, startedAt: input.startedAt })
    .returning();
  return workout;
}

export async function deleteWorkout(workoutId: number) {
  const userId = await requireUserId();

  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId))); // ID AND userId
}
```

## 2. Mutations are triggered ONLY by server actions

> **ALL data mutations MUST be triggered through Server Actions.**

- Do NOT mutate data from route handlers (`app/**/route.ts`), client components calling `fetch`, or server components during render.
- A server action's job: validate input → call a `/data` helper → revalidate/redirect. Nothing else.
- Check the bundled Next.js docs (`node_modules/next/dist/docs/`) for current Server Action and cache revalidation APIs before writing one — they differ from older versions.

## 3. Server actions live in co-located `actions.ts` files

- Server actions MUST be in a file named **`actions.ts`**, placed in the same folder as the route/component that uses them.
- The file starts with the `"use server"` directive.
- Do not define server actions inline inside components, and do not create a global `actions/` folder.

```
app/
  dashboard/
    page.tsx
    date-picker.tsx
    actions.ts        <- actions used by /dashboard
  workouts/
    new/
      page.tsx
      actions.ts      <- actions used by /workouts/new
```

If two routes need the same mutation, share the underlying `/data` helper — each route still gets its own `actions.ts` entry point.

## 4. Action parameters: typed, never `FormData`, validated with Zod

### Typed params, NO `FormData`

- Every server action parameter MUST have an explicit TypeScript type.
- Server actions MUST NOT accept `FormData` as a parameter type. Call them from client components with plain typed arguments (e.g. from an event handler or `useTransition`), not as a `<form action={...}>` that hands over `FormData`.
- Prefer a single typed object parameter for anything with more than one field.

### Validate EVERYTHING with Zod

> **Every server action MUST validate its arguments with [Zod](https://zod.dev) before doing anything else.**

TypeScript types vanish at runtime, and server actions are public HTTP endpoints — anyone can call them with any payload. Zod is the runtime check.

- Define a Zod schema for each action's arguments in the same `actions.ts` file (or a `schema.ts` beside it if shared with the client form).
- Derive the TypeScript parameter type from the schema with `z.infer` so the two can never drift.
- Parse the arguments as the FIRST step of the action, before `requireUserId()` data work, DB calls, or anything else.
- Use `safeParse` and return a typed error result on failure; do not let a raw `ZodError` leak to the client.
- NEVER put `userId` in a schema or accept it as an argument. Identity comes from the session (see `docs/auth.md`).
- Coerce/validate dates, numbers, and IDs explicitly (`z.number().int().positive()`, `z.coerce.date()`, etc.). Set sensible bounds (string max length, reps/weight ranges) rather than bare `z.string()` / `z.number()`.
- Note: `zod` must be a direct dependency in `package.json` (`npm install zod`) — it should not be relied on as a transitive dependency.

### Example

```ts
// app/workouts/new/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  startedAt: z.coerce.date(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const parsed = createWorkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid workout data" };
  }

  const workout = await createWorkout(parsed.data); // helper resolves the user itself
  revalidatePath("/dashboard");
  return { success: true as const, id: workout.id };
}
```

```tsx
// app/workouts/new/new-workout-form.tsx
"use client";

import { createWorkoutAction } from "./actions";

// Called with plain typed arguments — no FormData.
async function onSubmit() {
  const result = await createWorkoutAction({ name, startedAt: date });
  if (!result.success) setError(result.error);
}
```

## Checklist

- [ ] Writes are done in a `/data` helper using Drizzle ORM — no raw SQL, no inline queries elsewhere
- [ ] Helper gets `userId` from `requireUserId()` (no `userId` parameter, none accepted from input)
- [ ] Updates/deletes filter by record ID **and** `userId`; child tables are checked through `workouts.userId`
- [ ] The mutation is triggered from a server action, not a route handler or client `fetch`
- [ ] The action is in a co-located file named `actions.ts` with `"use server"`
- [ ] All action parameters are explicitly typed and are NOT `FormData`
- [ ] Arguments are validated with a Zod schema as the first step (`safeParse`), and the param type comes from `z.infer`
- [ ] Revalidation/redirect happens in the action, not in the `/data` helper
