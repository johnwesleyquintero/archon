import type { Database } from "@/lib/supabase/types";

export type JournalEntry =
  Database["public"]["Tables"]["journal_entries"]["Row"] & {
    user_id: string;
    tags: string[] | null;
  };
