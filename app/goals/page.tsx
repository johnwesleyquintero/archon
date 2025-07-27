import { GoalTrackerWithAttachments } from "@/components/goal-tracker-with-attachments";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getGoals } from "@/lib/database/goals";

export default async function GoalsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialGoals = user ? await getGoals() : [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Goals</h1>
      <GoalTrackerWithAttachments initialGoals={initialGoals} />
    </div>
  );
}
