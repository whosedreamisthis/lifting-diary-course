import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateWorkout, revalidatePath, redirect } = vi.hoisted(() => ({
  updateWorkout: vi.fn(),
  revalidatePath: vi.fn(),
  // Real redirect() throws to halt execution; mirror that.
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock("@/data/workouts", () => ({ updateWorkout }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect }));

import { updateWorkoutAction } from "./actions";

const valid = { id: 1, name: "Push day", date: "2025-09-01" };

describe("updateWorkoutAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["non-integer id", { ...valid, id: 1.5 }],
    ["zero id", { ...valid, id: 0 }],
    ["negative id", { ...valid, id: -3 }],
    ["malformed date", { ...valid, date: "01/09/2025" }],
    ["impossible date", { ...valid, date: "2025-99-99" }],
    ["name over 100 chars", { ...valid, name: "x".repeat(101) }],
  ])("rejects %s without touching the database", async (_label, input) => {
    const result = await updateWorkoutAction(input);

    expect(result).toEqual({ success: false, error: "Invalid workout details." });
    expect(updateWorkout).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns an error when the workout is missing or not owned by the user", async () => {
    updateWorkout.mockResolvedValue(undefined);

    const result = await updateWorkoutAction(valid);

    expect(result).toEqual({ success: false, error: "Workout not found." });
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("updates, revalidates, and redirects to the workout's date on success", async () => {
    updateWorkout.mockResolvedValue({ id: 1 });

    await expect(updateWorkoutAction(valid)).rejects.toThrow(
      "NEXT_REDIRECT:/dashboard?date=2025-09-01",
    );

    expect(updateWorkout).toHaveBeenCalledWith({
      id: 1,
      name: "Push day",
      date: "2025-09-01",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("trims the name and clears it when blank", async () => {
    updateWorkout.mockResolvedValue({ id: 1 });

    await expect(
      updateWorkoutAction({ ...valid, name: "   " }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(updateWorkout).toHaveBeenCalledWith({
      id: 1,
      name: undefined,
      date: "2025-09-01",
    });
  });
});
