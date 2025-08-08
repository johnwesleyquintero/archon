"use client";

import { useQuickAddGoal } from "@/lib/state/use-quick-add-goal";
import { GoalForm } from "@/components/goal-form";
import { useGoals } from "@/hooks/use-goals";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

// The type for the data passed from GoalForm's onSave
type GoalSaveData = {
  id?: string;
  title: string;
  description: string;
  target_date?: string;
};

export function QuickAddGoalModal() {
  const { isOpen, close } = useQuickAddGoal();
  const { addGoal } = useGoals();
  const { user } = useAuth();

  const handleSaveGoal = (data: GoalSaveData) => {
    if (!user) {
      toast.error("You must be logged in to add a goal.");
      return;
    }

    const save = async () => {
      // The user_id is handled by the server, so we don't pass it here.
      await addGoal(data);
      toast.success("Goal added successfully!");
      // The GoalForm handles its own closing, but we also call close here
      // to ensure the state is in sync.
      close();
    };

    void save();
  };

  return (
    <GoalForm
      isOpen={isOpen}
      onClose={close}
      onSave={handleSaveGoal}
      initialGoal={null}
    />
  );
}
