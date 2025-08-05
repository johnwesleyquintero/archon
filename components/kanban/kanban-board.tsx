import React from "react";
import { KanbanColumn } from "./kanban-column";
import { Column } from "@/lib/types/kanban";

interface KanbanBoardProps {
  columns: Column[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns }) => {
  return (
    <div className="flex space-x-4 overflow-x-auto p-4">
      {columns.map((column) => (
        <KanbanColumn key={column.id} column={column} />
      ))}
    </div>
  );
};
