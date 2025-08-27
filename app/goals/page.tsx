import { DashboardLayout } from "@/components/dashboard-layout";
import { GoalManager } from "@/components/goal-manager";

export default function GoalsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-slate-900">Goals</h1>
        <GoalManager />
      </div>
    </DashboardLayout>
  );
}
