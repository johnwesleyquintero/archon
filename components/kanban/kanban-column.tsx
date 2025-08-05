import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { KanbanCard } from "./kanban-card";
import { Column } from "@/lib/types/kanban";

interface KanbanColumnProps {
  column: Column;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column }) => {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: "Column", column },
  });

  return (
    <div
      ref={setNodeRef}
      className="w-80 flex-shrink-0 rounded-lg bg-gray-100 p-4 shadow-md dark:bg-gray-800"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
        {column.title}
      </h2>
      <SortableContext items={column.tasks.map((t) => t.id)}>
        <div className="space-y-3">
          {column.tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};
