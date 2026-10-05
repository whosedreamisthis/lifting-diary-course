"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { updateWorkout } from "@/data/workouts";
import { dateStringSchema } from "@/lib/date-schema";

const updateWorkoutSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().max(100).optional(),
  date: dateStringSchema,
});

type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

export async function updateWorkoutAction(input: UpdateWorkoutInput) {
  const parsed = updateWorkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid workout details." };
  }

  const { id, name, date } = parsed.data;
  const workout = await updateWorkout({ id, name: name || undefined, date });
  if (!workout) {
    return { success: false as const, error: "Workout not found." };
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard?date=${date}`);
}
