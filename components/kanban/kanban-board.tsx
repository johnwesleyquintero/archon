import React from "react";
import { KanbanColumn } from "./kanban-column";
import { Task } from "@/lib/types/task";

interface KanbanBoardProps {
  columns: {
    id: string;
    title: string;
    taskIds: string[];
  }[];
  tasks: Record<string, Task>;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns, tasks }) => {
  return (
    <div className="flex space-x-4 overflow-x-auto p-4">
      {columns.map((column) => (
        <KanbanColumn key={column.id} column={column} tasks={tasks} />
      ))}
    </div>
  );
};
