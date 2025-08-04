import { GoalsDisplay } from "@/components/goals-display";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getGoals } from "@/lib/database/goals";
import { getAuthenticatedUser } from "@/lib/supabase/auth-utils";

export default async function GoalsPage() {
  const user = await getAuthenticatedUser();

  const initialGoals = user ? await getGoals(user.id) : [];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-slate-900">Goals</h1>
        <GoalsDisplay initialGoals={initialGoals} />
      </div>
    </DashboardLayout>
  );
}
