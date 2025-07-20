import { GoalTrackerWithAttachments } from "@/components/goal-tracker-with-attachments";

export default function GoalsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Goals</h1>
      <GoalTrackerWithAttachments />
    </div>
  );
}
