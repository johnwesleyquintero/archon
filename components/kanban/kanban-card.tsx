import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/lib/types/task";

interface KanbanCardProps {
  task: Task;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="mb-2 cursor-grab active:cursor-grabbing">
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};
