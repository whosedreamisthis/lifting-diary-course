import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWorkoutById } from "@/data/workouts";

import { EditWorkoutForm } from "./edit-workout-form";

export default async function EditWorkoutPage({
  params,
}: PageProps<"/dashboard/workout/[workoutId]">) {
  const { workoutId } = await params;
  const id = Number(workoutId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const workout = await getWorkoutById(id);
  if (!workout) notFound();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Edit workout</CardTitle>
        </CardHeader>
        <CardContent>
          <EditWorkoutForm
            id={workout.id}
            initialName={workout.name ?? ""}
            initialDate={workout.startedAt.toISOString().slice(0, 10)}
          />
        </CardContent>
      </Card>
    </main>
  );
}
