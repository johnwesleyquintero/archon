import { useDraggable } from "@dnd-kit/core";

interface KanbanCardProps {
  task: {
    id: string;
    title: string;
    // Add other task properties as needed
  };
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-700 cursor-grab"
    >
      <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
        {task.title}
      </h3>
      {/* Add more task details here */}
    </div>
  );
};
