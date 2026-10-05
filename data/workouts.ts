import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { workouts } from "@/db/schema";
import { requireUserId } from "@/data/auth";

// Day boundaries are UTC; "YYYY-MM-DD" maps to [00:00Z, next 00:00Z).
function dayRange(date: string) {
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export async function getWorkoutsForDate(date: string) {
  const userId = await requireUserId(); // session user, never a parameter
  const { start, end } = dayRange(date);

  return db.query.workouts.findMany({
    where: { userId, startedAt: { gte: start, lt: end } },
    orderBy: { startedAt: "asc" },
    with: {
      workoutExercises: {
        orderBy: { position: "asc" },
        with: {
          exercise: true,
          sets: { orderBy: { setNumber: "asc" } },
        },
      },
    },
  });
}

export async function getWorkoutById(workoutId: number) {
  const userId = await requireUserId();

  return db.query.workouts.findFirst({
    where: { id: workoutId, userId }, // ID AND userId, never ID alone
  });
}

export async function updateWorkout(input: {
  id: number;
  name?: string;
  date: string;
}) {
  const userId = await requireUserId();
  const { start } = dayRange(input.date);

  const [workout] = await db
    .update(workouts)
    .set({ name: input.name ?? null, startedAt: start })
    .where(and(eq(workouts.id, input.id), eq(workouts.userId, userId)))
    .returning();
  return workout;
}

export async function createWorkout(input: { name?: string; date: string }) {
  const userId = await requireUserId(); // session user, never a parameter
  const { start } = dayRange(input.date);

  const [workout] = await db
    .insert(workouts)
    .values({ userId, name: input.name, startedAt: start })
    .returning();
  return workout;
}
