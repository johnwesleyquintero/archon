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

interface KanbanViewProps {
  initialTasks: Task[];
}

export function KanbanView({ initialTasks }: KanbanViewProps) {
  const { columns, handleDragEnd } = useKanban(initialTasks);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <KanbanBoard columns={columns} />
    </DndContext>
  );
}
