"use client";

import useSWR from "swr";
import { useState, useMemo } from "react";
import type { Database } from "@/lib/supabase/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit } from "lucide-react";
import { GoalForm } from "@/components/goal-form";
import { createGoal, updateGoal } from "@/app/goals/actions";
import { Progress } from "@/components/ui/progress"; // Assuming a progress component exists or will be created

type Milestone = {
  id: string;
  description: string;
  completed: boolean;
};

type Goal = Database["public"]["Tables"]["goals"]["Row"] & {
  milestones: Milestone[] | null;
};

export interface GoalsDisplayProps extends Record<string, unknown> {
  initialGoals?: Goal[];
}

type GoalFormData = {
  id?: string;
  title: string;
  description: string;
  target_date?: string;
  progress?: number;
  milestones: Milestone[] | null;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const GoalsDisplay: React.FC<GoalsDisplayProps> = ({ initialGoals }) => {
  const {
    data: goals,
    error,
    mutate,
  } = useSWR<Goal[], Error>("/api/goals", fetcher, {
    fallbackData: initialGoals,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSaveGoal = async (goalData: GoalFormData) => {
    try {
      if (goalData.id) {
        // Update existing goal
        await updateGoal(goalData.id, {
          title: goalData.title,
          description: goalData.description,
          target_date: goalData.target_date,
          progress: goalData.progress,
          milestones: goalData.milestones,
        });
      } else {
        // Create new goal
        await createGoal(goalData);
      }
      await mutate(); // Revalidate SWR cache
      setIsFormOpen(false);
      setEditingGoal(null);
    } catch (error) {
      console.error("Failed to save goal:", error);
      // Optionally, show an error message to the user
    }
  };

  const handleEditClick = (goal: Goal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const filteredAndSortedGoals = useMemo(() => {
    if (!goals) return [];

    const filtered = goals.filter((goal) => {
      const matchesStatus =
        statusFilter === "all" || goal.status === statusFilter;
      const matchesSearch =
        goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (goal.description &&
          goal.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });

    filtered.sort((a, b) => {
      if (sortBy === "created_at") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      if (sortBy === "target_date") {
        if (!a.target_date && !b.target_date) return 0;
        if (!a.target_date) return 1;
        if (!b.target_date) return -1;
        return (
          new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
        );
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return filtered;
  }, [goals, statusFilter, sortBy, searchTerm]);

  if (error) return <div>Failed to load goals.</div>;
  if (!goals) return <div>Loading goals...</div>;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Your Goals</h2>
        <Button
          onClick={() => {
            setIsFormOpen(true);
            setEditingGoal(null);
          }}
          className="ml-4"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Goal
        </Button>
      </div>
      <div className="flex space-x-4 mb-4">
        <Input
          placeholder="Search goals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Newest First</SelectItem>
            <SelectItem value="target_date">Target Date</SelectItem>
            <SelectItem value="title">Title (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filteredAndSortedGoals.length === 0 ? (
        <p>No goals found matching your criteria.</p>
      ) : (
        <ul>
          {filteredAndSortedGoals.map((goal) => (
            <li
              key={goal.id}
              className="mb-2 p-2 border rounded flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{goal.title}</h3>
                <p className="text-sm text-gray-600">{goal.description}</p>
                <p className="text-xs text-gray-500">Status: {goal.status}</p>
                {goal.target_date && (
                  <p className="text-xs text-gray-500">
                    Target Date:{" "}
                    {new Date(goal.target_date).toLocaleDateString()}
                  </p>
                )}
                {goal.progress !== null && goal.progress !== undefined && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Progress: {goal.progress}%
                    </p>
                    <Progress value={goal.progress} className="w-[60%]" />
                  </div>
                )}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium">Milestones:</h4>
                    <ul className="list-disc list-inside text-xs text-gray-600">
                      {goal.milestones.map((milestone) => (
                        <li
                          key={milestone.id}
                          className={milestone.completed ? "line-through" : ""}
                        >
                          {milestone.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditClick(goal)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <GoalForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingGoal(null);
        }}
        onSave={(goal) => void handleSaveGoal(goal)}
        initialGoal={editingGoal}
      />
    </div>
  );
};
