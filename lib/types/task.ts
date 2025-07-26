import type { Database } from "@/lib/supabase/types";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];

export interface TaskItemProps extends Task {
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  disabled: boolean;
}
