"use client";

import { useState, useEffect } from "react";
import { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Task } from "@/lib/types/task";
import { Column } from "@/lib/types/kanban";
import { updateTask } from "@/app/tasks/actions";

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

  const findColumn = (id: string) => columns.find((col) => col.id === id);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeColumn = findColumn(active.data.current?.sortable.containerId);
    const overColumn = findColumn(over.data.current?.sortable.containerId);

    if (!activeColumn || !overColumn) return;

    const activeIndex = activeColumn.tasks.findIndex((t) => t.id === active.id);
    const overIndex = overColumn.tasks.findIndex((t) => t.id === over.id);

    const task = activeColumn.tasks[activeIndex];

    // Optimistically update UI
    setColumns((prev) => {
      const newColumns = [...prev];
      const sourceColIndex = newColumns.findIndex(
        (c) => c.id === activeColumn.id,
      );
      const destColIndex = newColumns.findIndex((c) => c.id === overColumn.id);

      if (sourceColIndex === destColIndex) {
        // Reordering in the same column
        newColumns[sourceColIndex].tasks = arrayMove(
          newColumns[sourceColIndex].tasks,
          activeIndex,
          overIndex,
        );
      } else {
        // Moving to a different column
        const [movedTask] = newColumns[sourceColIndex].tasks.splice(
          activeIndex,
          1,
        );
        newColumns[destColIndex].tasks.splice(overIndex, 0, movedTask);
      }
      return newColumns;
    });

    // Update backend
    try {
      await updateTask(task.id, {
        status: overColumn.id as Task["status"],
      });
      // Optionally refresh data or handle success
    } catch (error) {
      console.error("Failed to update task status:", error);
      // Revert state on error if needed
    }
  };

  return { columns, setColumns, handleDragEnd, findColumn };
};
