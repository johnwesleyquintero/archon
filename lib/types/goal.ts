import type { Database } from "@/lib/supabase/types";

export type Milestone = {
  id: string;
  description: string;
  completed: boolean;
};

export type Goal = Database["public"]["Tables"]["goals"]["Row"] & {
  milestones: Milestone[] | null;
};
