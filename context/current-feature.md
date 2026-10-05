# Current Feature: Edit Workout

Create a new page at `/dashboard/workout/[workoutId]` that serves as the edit/update workout page.

## Status

In Progress

## Goals

- New server-component page at `app/dashboard/workout/[workoutId]/page.tsx` for editing a workout
- Fetch the workout with a new `getWorkoutById(workoutId)` helper in `data/workouts.ts` (filter by id AND session userId; call `notFound()` if missing)
- Client edit form pre-filled with the workout's name and date, mirroring `new/new-workout-form.tsx`
- New `updateWorkout` data helper (Drizzle, `requireUserId()`, filter by id AND userId) and `updateWorkoutAction` in a co-located `actions.ts` (Zod-validated, typed params, no `FormData`; revalidate and redirect to `/dashboard?date=...`)
- Link to the edit page from workout cards on `/dashboard`

## Notes

- Follow `docs/ui.md`, `docs/auth.md`, `docs/data-fetching.md`, `docs/data-mutations.md`.
- Check `node_modules/next/dist/docs/` for `PageProps<"/dashboard/workout/[workoutId]">` and async `params` before writing the page.
- Validate `workoutId` as a positive integer.
- The spec is brief; scope beyond name/date (exercises/sets) is unspecified, so assume name and date only.

## Completed Features

<!-- One line per completed feature, earliest to latest. Full details in context/feature-history.md -->
