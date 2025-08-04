"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
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

import { updateTask, TaskUpdate } from "@/app/tasks/actions";
import { Task } from "@/lib/types/task";

interface KanbanPageProps {
  initialTasks: Task[];
}

const KanbanPage = ({ initialTasks }: KanbanPageProps) => {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const columns = useMemo(() => {
    const initialColumns = [
      { id: "todo", title: "To Do", taskIds: [] as string[] },
      { id: "in-progress", title: "In Progress", taskIds: [] as string[] },
      { id: "done", title: "Done", taskIds: [] as string[] },
    ];

    const tasksById: Record<string, Task> = {};

    tasks.forEach((task) => {
      tasksById[task.id] = task;
      const columnIndex = initialColumns.findIndex(
        (col) => col.id === task.status,
      );
      if (columnIndex !== -1) {
        initialColumns[columnIndex].taskIds.push(task.id);
      } else {
        // Fallback for tasks without a valid status, assign to 'todo'
        initialColumns[0].taskIds.push(task.id);
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
      const oldColumnId = activeTask.status;
      const newColumnId =
        (over.data.current as SortableData)?.sortable?.containerId ||
        String(over.id);

      if (oldColumnId !== newColumnId) {
        // Moving between columns
        const newStatus = newColumnId as Task["status"];

        await updateTask(activeId, {
          status: newStatus,
        } as Partial<TaskUpdate>);

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === activeId ? { ...task, status: newStatus } : task,
          ),
        );
        router.refresh();
      } else {
        // Reordering within the same column (not implemented yet, requires more complex state management)
        // For now, we only handle column changes.
      }
    },
    [tasks, router],
  );

  return (
    <div className="p-4">
      <h1 className="mb-6 text-3xl font-bold">Kanban Board</h1>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={(event) => void handleDragEnd(event)}
      >
        <KanbanBoard
          columns={columns.initialColumns}
          tasks={columns.tasksById}
        />
      </DndContext>
    </div>
  );
};

export { KanbanPage };
