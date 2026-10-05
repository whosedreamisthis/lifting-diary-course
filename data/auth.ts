import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Returns the session user's ID; sends signed-out visitors to sign-in.
export async function requireUserId() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}
