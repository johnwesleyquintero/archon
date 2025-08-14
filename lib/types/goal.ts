import type { Database } from "@/lib/supabase/types";

export type Goal = Omit<
  Database["public"]["Tables"]["goals"]["Row"],
  "milestones"
> & {
  tags: string[] | null;
  current_progress?: number | null;
  target_progress?: number | null;
};
