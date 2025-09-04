"use client";

import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner"; // Import toast for user feedback

import { updateTask } from "@/app/tasks/actions";
import { Column } from "@/lib/types/kanban";
import { Task } from "@/lib/types/task";

export const useKanban = (initialTasks: Task[]) => {
  const [columns, setColumns] = useState<Column[]>(() => [
    { id: "todo", title: "To Do", tasks: [] },
    { id: "in_progress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ]);

  useEffect(() => {
    const newColumns = [
      { id: "todo", title: "To Do", tasks: [] as Task[] },
      { id: "in_progress", title: "In Progress", tasks: [] as Task[] },
      { id: "done", title: "Done", tasks: [] as Task[] },
    ];

    initialTasks.forEach((task) => {
      // Default to 'todo'
      newColumns[0].tasks.push(task);
    });

    setColumns(newColumns);
  }, [initialTasks]);

  const findColumn = useCallback(
    (id: string) => columns.find((col) => col.id === id),
    [columns],
  );

  const updateColumnTasks = useCallback(
    (
      sourceColId: string,
      destColId: string,
      activeTaskId: string | number,
      overTaskId: string | number,
    ) => {
      setColumns((prev) => {
        const newColumns = [...prev];
        const sourceColIndex = newColumns.findIndex(
          (c) => c.id === sourceColId,
        );
        const destColIndex = newColumns.findIndex((c) => c.id === destColId);

        if (sourceColIndex === -1 || destColIndex === -1) return prev;

        const activeColumn = newColumns[sourceColIndex];
        const overColumn = newColumns[destColIndex];

        const activeIndex = activeColumn.tasks.findIndex(
          (t) => t.id === activeTaskId,
        );
        const overIndex = overColumn.tasks.findIndex(
          (t) => t.id === overTaskId,
        );

        if (activeIndex === -1) return prev; // Should not happen if active.id is valid

        if (sourceColId === destColId) {
          // Reordering in the same column
          newColumns[sourceColIndex].tasks = arrayMove(
            activeColumn.tasks,
            activeIndex,
            overIndex,
          );
        } else {
          // Moving to a different column
          const [movedTask] = activeColumn.tasks.splice(activeIndex, 1);
          if (movedTask) {
            newColumns[destColIndex].tasks.splice(overIndex, 0, movedTask);
          }
        }
        return newColumns;
      });
    },
    [],
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeColumnId = (active.data.current?.sortable as { containerId: string })?.containerId; // Added type assertion
    const overColumnId = (over.data.current?.sortable as { containerId: string })?.containerId; // Added type assertion

    if (!activeColumnId || !overColumnId) return;

    const originalColumns = JSON.parse(JSON.stringify(columns)) as Column[]; // Deep copy for rollback

    // Optimistically update UI
    updateColumnTasks(activeColumnId, overColumnId, active.id, over.id);

    const taskToUpdate = originalColumns
      .find((col) => col.id === activeColumnId)
      ?.tasks.find((t) => t.id === active.id);

    if (!taskToUpdate) {
      toast.error("Task not found for update.");
      setColumns(originalColumns); // Rollback
      return;
    }

    try {
      await updateTask(taskToUpdate.id, {});
      toast.success("Task status updated successfully.");
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to update task status. Reverting changes.");
      setColumns(originalColumns); // Revert state on error
    }
  };

  return { columns, setColumns, handleDragEnd, findColumn };
};
