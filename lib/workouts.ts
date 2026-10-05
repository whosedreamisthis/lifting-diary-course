import { db } from "@/db";

// Day boundaries are UTC; "YYYY-MM-DD" maps to [00:00Z, next 00:00Z).
export function dayRange(date: string) {
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export function getWorkoutsForDate(userId: string, date: string) {
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
