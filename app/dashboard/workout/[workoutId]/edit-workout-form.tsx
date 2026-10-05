"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { updateWorkoutAction } from "./actions";

// initialDate is "YYYY-MM-DD" (UTC day of startedAt), the same day the dashboard shows.
export function EditWorkoutForm({
  id,
  initialName,
  initialDate,
}: {
  id: number;
  initialName: string;
  initialDate: string;
}) {
  const [name, setName] = useState(initialName);
  const [date, setDate] = useState(() => {
    const [y, m, d] = initialDate.split("-").map(Number);
    return new Date(y, m - 1, d);
  });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      // Local calendar day as "YYYY-MM-DD"; the action redirects on success.
      const result = await updateWorkoutAction({
        id,
        name,
        date: format(date, "yyyy-MM-dd"),
      });
      if (result && !result.success) setError(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name (optional)</Label>
        <Input
          id="name"
          value={name}
          maxLength={100}
          placeholder="e.g. Push day"
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Date</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="w-60 justify-start font-normal"
              />
            }
          >
            <CalendarIcon />
            {format(date, "do MMM yyyy")}
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              required
              selected={date}
              defaultMonth={date}
              onSelect={(next) => {
                setDate(next);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={`/dashboard?date=${initialDate}`} />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
