# Feature History

Full summaries of completed features, earliest to latest.

- **Edit Workout:** Adds an edit page at `/dashboard/workout/[workoutId]` (server component; `workoutId` validated as a positive integer, `notFound()` if missing or not owned). New `getWorkoutById` and `updateWorkout` helpers in `data/workouts.ts` use Drizzle, `requireUserId()`, and filter by id AND session userId. `updateWorkoutAction` in a co-located `actions.ts` validates with Zod (typed params, no `FormData`), revalidates `/dashboard`, and redirects to `/dashboard?date=...`. `edit-workout-form.tsx` is a client form pre-filled with name and date, modelled on the new-workout form. A route-scoped `not-found.tsx` ("Workout not found") and `error.tsx` (retry + back to dashboard) keep the navbar visible. Dashboard workout cards gain an Edit link. Also adds Vitest (`npm test`, `vitest.config.mts`) with 9 tests for `updateWorkoutAction`. Scope is name and date only; exercises and sets are not editable.
