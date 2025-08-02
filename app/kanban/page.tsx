"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  DndContext,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { KanbanBoard } from "@/components/kanban/kanban-board";
import { getTasks, updateTask } from "@/lib/database/tasks";
import { Task } from "@/lib/types/task";

const KanbanPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasksData = async () => {
      setLoading(true);
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
      setLoading(false);
    };
    void fetchTasksData(); // Explicitly mark as void
  }, []);

  const columns = useMemo(() => {
    const initialColumns = [
      { id: "low", title: "Low Priority", taskIds: [] as string[] },
      { id: "medium", title: "Medium Priority", taskIds: [] as string[] },
      { id: "high", title: "High Priority", taskIds: [] as string[] },
      { id: "completed", title: "Completed", taskIds: [] as string[] },
    ];

    const tasksById: Record<string, Task> = {};

    tasks.forEach((task) => {
      tasksById[task.id] = task;
      if (task.is_completed) {
        initialColumns[3].taskIds.push(task.id);
      } else if (task.priority) {
        const columnIndex = initialColumns.findIndex(
          (col) => col.id === task.priority,
        );
        if (columnIndex !== -1) {
          initialColumns[columnIndex].taskIds.push(task.id);
        }
      } else {
        initialColumns[1].taskIds.push(task.id);
      }
    });

    return { initialColumns, tasksById };
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) return;

      const activeId = String(active.id);

      const activeTask = tasks.find((task) => task.id === activeId);
      if (!activeTask) return;

      interface SortableData {
        sortable?: {
          containerId: string;
        };
      }

      // Determine if we are moving between columns or reordering within a column
      const oldColumnId = activeTask.is_completed
        ? "completed"
        : activeTask.priority || "medium";
      const newColumnId =
        (over.data.current as SortableData)?.sortable?.containerId ||
        String(over.id);

      if (oldColumnId !== newColumnId) {
        // Moving between columns
        const newPriority =
          newColumnId === "completed"
            ? activeTask.priority
            : (newColumnId as "low" | "medium" | "high");
        const isCompleted = newColumnId === "completed";

        void updateTask(activeId, {
          priority: newPriority,
          is_completed: isCompleted,
        });

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === activeId
              ? { ...task, priority: newPriority, is_completed: isCompleted }
              : task,
          ),
        );
      } else {
        // Reordering within the same column (not implemented yet, requires more complex state management)
        // For now, we only handle column changes.
      }
    },
    [tasks],
  );

  if (loading) {
    return <div className="p-4">Loading Kanban Board...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="mb-6 text-3xl font-bold">Kanban Board</h1>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <KanbanBoard
          columns={columns.initialColumns}
          tasks={columns.tasksById}
        />
      </DndContext>
    </div>
  );
};

export default KanbanPage;
