import { defineRelations } from "drizzle-orm";
import {
  check,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// user_id columns store the Clerk user ID, so there is no local users table.

export const exercises = pgTable(
  "exercises",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    name: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("exercises_user_id_name_unique").on(table.userId, table.name),
  ],
);

export const workouts = pgTable(
  "workouts",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    name: text(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("workouts_user_id_started_at_idx").on(table.userId, table.startedAt),
  ],
);

// An exercise performed within a workout (join table between workouts and exercises).
export const workoutExercises = pgTable(
  "workout_exercises",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    workoutId: integer("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    position: integer().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("workout_exercises_workout_id_position_unique").on(
      table.workoutId,
      table.position,
    ),
    index("workout_exercises_exercise_id_idx").on(table.exerciseId),
  ],
);

export const sets = pgTable(
  "sets",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    workoutExerciseId: integer("workout_exercise_id")
      .notNull()
      .references(() => workoutExercises.id, { onDelete: "cascade" }),
    setNumber: integer("set_number").notNull(),
    reps: integer().notNull(),
    // kilograms; 0 = bodyweight
    weight: numeric({ precision: 7, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("sets_workout_exercise_id_set_number_unique").on(
      table.workoutExerciseId,
      table.setNumber,
    ),
    // TODO(human): add CHECK constraints for reps and weight (see request).
  ],
);

export const relations = defineRelations(
  { exercises, workouts, workoutExercises, sets },
  (r) => ({
    workouts: {
      workoutExercises: r.many.workoutExercises({
        from: r.workouts.id,
        to: r.workoutExercises.workoutId,
      }),
    },
    exercises: {
      workoutExercises: r.many.workoutExercises({
        from: r.exercises.id,
        to: r.workoutExercises.exerciseId,
      }),
    },
    workoutExercises: {
      workout: r.one.workouts({
        from: r.workoutExercises.workoutId,
        to: r.workouts.id,
        optional: false,
      }),
      exercise: r.one.exercises({
        from: r.workoutExercises.exerciseId,
        to: r.exercises.id,
        optional: false,
      }),
      sets: r.many.sets({
        from: r.workoutExercises.id,
        to: r.sets.workoutExerciseId,
      }),
    },
    sets: {
      workoutExercise: r.one.workoutExercises({
        from: r.sets.workoutExerciseId,
        to: r.workoutExercises.id,
        optional: false,
      }),
    },
  }),
);
