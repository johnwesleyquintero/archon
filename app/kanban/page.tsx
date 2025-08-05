"use client";

import React from "react";
import {
  DndContext,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { useKanban } from "@/hooks/use-kanban";
import { Task } from "@/lib/types/task";

// Mock initial tasks for demonstration purposes.
// In a real app, this would come from a server-side fetch.
const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Design the new logo",
    status: "todo",
    priority: "medium",
    due_date: null,
    created_at: new Date().toISOString(),
    is_completed: false,
    updated_at: new Date().toISOString(),
    user_id: "user-123",
    category: null,
    tags: null,
  },
  {
    id: "task-2",
    title: "Develop the landing page",
    status: "in-progress",
    priority: "high",
    due_date: null,
    created_at: new Date().toISOString(),
    is_completed: false,
    updated_at: new Date().toISOString(),
    user_id: "user-123",
    category: null,
    tags: null,
  },
  {
    id: "task-3",
    title: "Fix authentication bug",
    status: "in-progress",
    priority: "high",
    due_date: null,
    created_at: new Date().toISOString(),
    is_completed: false,
    updated_at: new Date().toISOString(),
    user_id: "user-123",
    category: null,
    tags: null,
  },
  {
    id: "task-4",
    title: "Write documentation",
    status: "done",
    priority: "low",
    due_date: null,
    created_at: new Date().toISOString(),
    is_completed: true,
    updated_at: new Date().toISOString(),
    user_id: "user-123",
    category: null,
    tags: null,
  },
];

interface KanbanPageProps {
  initialTasks?: Task[];
}

const KanbanPage = ({ initialTasks = mockTasks }: KanbanPageProps) => {
  const { columns, handleDragEnd } = useKanban(initialTasks);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <div className="p-4">
      <h1 className="mb-6 text-3xl font-bold">Kanban Board</h1>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <KanbanBoard columns={columns} />
      </DndContext>
    </div>
  );
};

export default KanbanPage;
