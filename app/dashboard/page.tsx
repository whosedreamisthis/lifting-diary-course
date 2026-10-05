import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWorkoutsForDate } from "@/data/workouts";

import { DatePicker } from "./date-picker";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function resolveDate(param: string | string[] | undefined) {
  const value = Array.isArray(param) ? param[0] : param;
  if (value && DATE_PATTERN.test(value) && !isNaN(Date.parse(value))) {
    return value;
  }
  return new Date().toISOString().slice(0, 10);
}

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const date = resolveDate((await searchParams).date);
  const workouts = await getWorkoutsForDate(date);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <DatePicker date={date} />
          <Button
            nativeButton={false}
            render={<Link href="/dashboard/workout/new" />}
          >
            <PlusIcon />
            Create workout
          </Button>
        </div>
      </div>

      {workouts.length === 0 ? (
        <p className="text-muted-foreground">No workouts logged for this date.</p>
      ) : (
        workouts.map((workout) => (
          <Card key={workout.id}>
            <CardHeader>
              <CardTitle>{workout.name ?? "Workout"}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {workout.workoutExercises.map((we) => (
                <section key={we.id}>
                  <h3 className="font-medium">{we.exercise.name}</h3>
                  <ol className="mt-1 text-sm text-muted-foreground">
                    {we.sets.map((set) => (
                      <li key={set.id}>
                        Set {set.setNumber}: {set.reps} reps ×{" "}
                        {Number(set.weight)} kg
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </main>
  );
}
