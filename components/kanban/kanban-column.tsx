import { Column } from "@/lib/types/kanban";

import { KanbanCard } from "./kanban-card";

interface KanbanColumnProps {
  column: Column;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column }) => {
  return (
    <div className="w-80 flex-shrink-0 rounded-lg bg-gray-100 p-4 shadow-md dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
        {column.title}
      </h2>
      <div className="space-y-3">
        {column.tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};
