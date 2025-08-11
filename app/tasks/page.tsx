import { TaskList } from "@/components/task-list";
import { Task, TaskStatus, TaskPriority } from "@/lib/types/task";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Goal } from "@/lib/types/goal";
import { CreateTaskModal } from "@/components/create-task-modal";
import type { TaskFormValues } from "@/lib/validators";
import { toast } from "sonner";
import {
  addTask as addSupabaseTask,
  updateTask as updateSupabaseTask,
} from "@/app/tasks/actions";
import { getGoals } from "@/lib/database/goals";
import { getTasks, TaskSortOptions, getUniqueTags } from "@/lib/database/tasks";
import { ErrorState } from "@/components/error-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { TaskFilterBar } from "@/components/task-filter-bar";
import { TaskSort } from "@/components/task-sort";
import {
  useTaskFiltersAndSort,
  TaskFilters,
} from "@/hooks/use-task-filters-and-sort";
import { useEffect, useState, useCallback } from "react"; // Import useCallback
import { useAuth } from "@/contexts/auth-context"; // Import useAuth

// Helper function to parse search params into filter and sort options
const parseSearchParams = (searchParams: {
  tags?: string | string[] | undefined;
  [key: string]: string | string[] | undefined;
}) => {
  const filters: {
    isCompleted?: boolean;
    status?: TaskStatus | "all";
    priority?: TaskPriority;
    dueDate?: "overdue" | "today" | "upcoming" | "none" | "all";
    category?: string;
    tags?: string[];
    search?: string;
    includeArchived?: boolean;
  } = {};

  const sorts: TaskSortOptions = {};

  // Parse filters
  if (searchParams.isCompleted) {
    const isCompleted = searchParams.isCompleted;
    filters.isCompleted =
      (Array.isArray(isCompleted) ? isCompleted[0] : isCompleted) === "true";
  }
  if (searchParams.status) {
    const status = searchParams.status;
    filters.status = (Array.isArray(status) ? status[0] : status) as
      | TaskStatus
      | "all";
  }
  if (searchParams.priority) {
    const priority = searchParams.priority;
    filters.priority = (
      Array.isArray(priority) ? priority[0] : priority
    ) as TaskPriority;
  }
  if (searchParams.dueDate) {
    const dueDate = searchParams.dueDate;
    filters.dueDate = (Array.isArray(dueDate) ? dueDate[0] : dueDate) as
      | "overdue"
      | "today"
      | "upcoming"
      | "none"
      | "all";
  }
  if (searchParams.category) {
    const category = searchParams.category;
    filters.category = Array.isArray(category) ? category[0] : category;
  }
  // Handle searchParams.tags
  if (searchParams.tags) {
    const tags = searchParams.tags;
    filters.tags = (Array.isArray(tags) ? tags : [tags]).filter(
      (tag): tag is string => typeof tag === "string",
    );
  }
  if (searchParams.search) {
    const search = searchParams.search;
    filters.search = Array.isArray(search) ? search[0] : search;
  }
  if (searchParams.includeArchived) {
    const includeArchived = searchParams.includeArchived;
    filters.includeArchived =
      (Array.isArray(includeArchived)
        ? includeArchived[0]
        : includeArchived) === "true";
  }

  // Parse sorts
  if (searchParams.sortBy) {
    const sortBy = searchParams.sortBy;
    sorts.sortBy = (Array.isArray(sortBy) ? sortBy[0] : sortBy) as
      | "created_at"
      | "due_date"
      | "priority"
      | "title"
      | "is_completed";
  }
  if (searchParams.sortOrder) {
    const sortOrder = searchParams.sortOrder;
    sorts.sortOrder = (Array.isArray(sortOrder) ? sortOrder[0] : sortOrder) as
      | "asc"
      | "desc";
  }

  return { filters: filters as TaskFilters, sorts };
};

export default function TasksPage({
  // Removed async
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { filters, sorts } = parseSearchParams(searchParams);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
        <TaskControls initialFilters={filters} initialSorts={sorts} />
      </div>
    </DashboardLayout>
  );
}

function TaskControls({
  initialFilters,
  initialSorts,
}: {
  initialFilters: TaskFilters; // Changed to TaskFilters
  initialSorts: TaskSortOptions;
}) {
  const { filters, sort, setFilter, setSort, clearFilters } =
    useTaskFiltersAndSort(initialFilters, initialSorts);
  const { user } = useAuth(); // Get user from auth context
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]); // For parent selection in subtasks
  const [goals, setGoals] = useState<Goal[]>([]); // For goal linking
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allAvailableTags, setAllAvailableTags] = useState<string[]>([]);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isSavingTask, setIsSavingTask] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setAllTasks([]);
      setGoals([]);
      setAllAvailableTags([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [fetchedTasks, fetchedTags, fetchedGoals] = await Promise.all([
        getTasks(filters, sort),
        getUniqueTags(),
        getGoals(user.id), // Pass user.id to getGoals
      ]);
      setTasks(fetchedTasks);
      setAllTasks(fetchedTasks); // All tasks for parent selection
      setAllAvailableTags(fetchedTags);
      setGoals(fetchedGoals);
    } catch (e) {
      console.error("Error fetching data in TaskControls:", e);
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [filters, sort, user]); // fetchAllData dependencies

  useEffect(() => {
    void fetchAllData();
  }, [fetchAllData]); // Now fetchAllData is stable

  const handleAddTaskClick = () => {
    setTaskToEdit(null);
    setIsAddTaskModalOpen(true);
  };

  const handleAddTask = async (taskData: TaskFormValues) => {
    setIsSavingTask(true);
    try {
      // The status casting is no longer needed as types are aligned
      await addSupabaseTask(taskData);
      toast.success("Task added successfully!");
      setIsAddTaskModalOpen(false);
      await fetchAllData(); // Refresh all data
    } catch (err) {
      console.error("Error adding task:", err);
      toast.error("Failed to add task.");
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsEditTaskModalOpen(true);
  };

  const handleUpdateTask = async (
    taskData: TaskFormValues,
    taskId?: string,
  ) => {
    setIsSavingTask(true);
    try {
      // The status casting is no longer needed as types are aligned
      if (taskId) {
        await updateSupabaseTask(taskId, taskData);
      } else {
        toast.error("Task ID is missing for update operation.");
      }
      toast.success("Task updated successfully!");
      setIsEditTaskModalOpen(false); // Corrected typo
      await fetchAllData(); // Refresh all data
    } catch (err) {
      console.error("Error updating task:", err);
      toast.error("Failed to update task.");
    } finally {
      setIsSavingTask(false);
    }
  };

  return (
    <>
      <CreateTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSaveOrUpdate={handleAddTask}
        isSaving={isSavingTask}
        allTasks={allTasks}
        goals={goals}
      />
      {taskToEdit && (
        <CreateTaskModal
          isOpen={isEditTaskModalOpen}
          onClose={() => setIsEditTaskModalOpen(false)}
          onSaveOrUpdate={handleUpdateTask}
          isSaving={isSavingTask}
          initialData={taskToEdit}
          allTasks={allTasks}
          goals={goals}
        />
      )}

      <div className="flex flex-wrap items-center gap-4">
        <TaskFilterBar
          currentFilter={filters.status || "all"}
          onFilterChange={(status) =>
            setFilter("status", status as TaskStatus | "all")
          }
          dueDateFilter={filters.dueDate || "all"}
          onDueDateFilterChange={(dueDate) =>
            setFilter(
              "dueDate",
              dueDate as "overdue" | "today" | "upcoming" | "none" | "all",
            )
          }
          categoryFilter={filters.category || "all"}
          onCategoryFilterChange={(category) => setFilter("category", category)}
          tagFilter={filters.tags?.[0] || "all"}
          onTagFilterChange={(tag) =>
            setFilter("tags", tag ? [tag] : undefined)
          }
          allAvailableTags={allAvailableTags}
          onClearFilters={clearFilters}
        />
        <TaskSort
          sort={sort}
          onSortChange={(newSort) => {
            setSort(newSort);
          }}
        />
      </div>
      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <LoadingSkeleton />
      ) : (
        <TaskList
          tasks={tasks}
          loading={loading}
          onAddTaskClick={handleAddTaskClick}
          onAddTask={handleAddTask}
          allTasks={allTasks}
          goals={goals}
          onEditTask={handleEditTask}
        />
      )}
    </>
  );
}
