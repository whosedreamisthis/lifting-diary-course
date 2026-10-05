"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().trim().max(100).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => !isNaN(Date.parse(value))),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const parsed = createWorkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid workout details." };
  }

  const { name, date } = parsed.data;
  await createWorkout({ name: name || undefined, date });

  revalidatePath("/dashboard");
  redirect(`/dashboard?date=${date}`);
}
