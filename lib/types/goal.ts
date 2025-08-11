import type { Database } from "@/lib/supabase/types";

export type Goal = Omit<
  Database["public"]["Tables"]["goals"]["Row"],
  "milestones"
> & {
  tags: string[] | null;
};
