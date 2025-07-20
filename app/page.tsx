import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/auth";

export default async function HomePage() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }

  return null; // This page only handles redirection
}
