"use client";

import { useState, useEffect, useCallback } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Task } from "@/lib/types/task";
import { Column } from "@/lib/types/kanban";
import { updateTask } from "@/app/tasks/actions";
import { toast } from "sonner"; // Import toast for user feedback

export const useKanban = (initialTasks: Task[]) => {
  const [columns, setColumns] = useState<Column[]>(() => [
    { id: "todo", title: "To Do", tasks: [] },
    { id: "in-progress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ]);

  useEffect(() => {
    const newColumns = [
      { id: "todo", title: "To Do", tasks: [] as Task[] },
      { id: "in-progress", title: "In Progress", tasks: [] as Task[] },
      { id: "done", title: "Done", tasks: [] as Task[] },
    ];

    initialTasks.forEach((task) => {
      const columnIndex = newColumns.findIndex((col) => col.id === task.status);
      if (columnIndex !== -1) {
        newColumns[columnIndex].tasks.push(task);
      } else {
        newColumns[0].tasks.push(task); // Default to 'todo'
      }
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
            movedTask.status = destColId as Task["status"]; // Update task status optimistically
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

    const activeColumnId = active.data.current?.sortable.containerId as string;
    const overColumnId = over.data.current?.sortable.containerId as string;

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
      await updateTask(taskToUpdate.id, {
        status: overColumnId as Task["status"],
      });
      toast.success("Task status updated successfully.");
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to update task status. Reverting changes.");
      setColumns(originalColumns); // Revert state on error
    }
  };

  return { columns, setColumns, handleDragEnd, findColumn };
};
