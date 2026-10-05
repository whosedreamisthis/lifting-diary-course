import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { NewWorkoutForm } from "./new-workout-form";

export default function NewWorkoutPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">New workout</CardTitle>
        </CardHeader>
        <CardContent>
          <NewWorkoutForm />
        </CardContent>
      </Card>
    </main>
  );
}
