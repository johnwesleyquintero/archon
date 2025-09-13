"use client";

import { toast } from "sonner";

import { GoalForm } from "@/components/goal-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useGlobalShortcut } from "@/hooks/use-global-shortcut";
import { useGoals } from "@/hooks/use-goals";
import {
  useGlobalQuickAdd,
  QuickAddTab,
} from "@/lib/state/use-global-quick-add";

import { QuickAddJournalForm } from "./quick-add-journal-form";
import { QuickAddTaskForm } from "./quick-add-task-form";

type GoalSaveData = {
  id?: string;
  title: string;
  description: string;
  target_date?: string;
};

export function GlobalQuickAdd() {
  const { isOpen, close, activeTab, setActiveTab, open } = useGlobalQuickAdd();
  const { addGoal } = useGoals();
  const { user } = useAuth();

  useGlobalShortcut("k", open);

  const handleGoalSave = (data: GoalSaveData) => {
    if (!user) {
      toast.error("You must be logged in to add a goal.");
      return;
    }
    addGoal(data);
    toast.success("Goal added successfully!");
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Quick Add</DialogTitle>
          <DialogDescription>
            Quickly add a new task, goal, or journal entry. Access this anytime
            with Ctrl/Cmd+K.
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as QuickAddTab)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="task">Task</TabsTrigger>
            <TabsTrigger value="goal">Goal</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
          </TabsList>
          <TabsContent value="task">
            <QuickAddTaskForm onSave={close} />
          </TabsContent>
          <TabsContent value="goal">
            {/* GoalForm is a full modal form, so we pass isOpen and onClose */}
            <GoalForm
              isOpen={activeTab === "goal" && isOpen}
              onClose={close}
              onSave={(data) => void handleGoalSave(data)}
              initialGoal={null}
              isDialog={false} // Prop to render as a form, not a dialog
            />
          </TabsContent>
          <TabsContent value="journal">
            <QuickAddJournalForm onSave={close} onCancel={close} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
