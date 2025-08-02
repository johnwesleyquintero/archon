import { useDroppable } from "@dnd-kit/core";
import { KanbanCard } from "./kanban-card";
import { Task } from "@/lib/types/task";

interface KanbanColumnProps {
  column: {
    id: string;
    title: string;
    taskIds: string[];
  };
  tasks: Record<string, Task>;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
}) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className="w-80 flex-shrink-0 rounded-lg bg-gray-100 p-4 shadow-md dark:bg-gray-800"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
        {column.title}
      </h2>
      <div className="space-y-3">
        {column.taskIds.map((taskId) => {
          const task = tasks[taskId];
          return task ? <KanbanCard key={task.id} task={task} /> : null;
        })}
      </div>
    </div>
  );
};
