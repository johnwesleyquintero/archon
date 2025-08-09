import type { Database } from "@/lib/supabase/types";

export type JournalEntry =
  Database["public"]["Tables"]["journal_entries"]["Row"] & {
    tags: string[] | null;
  };
