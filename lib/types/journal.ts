import type { Database } from "@/lib/supabase/types";

export type JournalEntry =
  Database["public"]["Tables"]["journal_entries"]["Row"] & {
    user_id: string;
    tags: string[] | null;
  };

export type JournalTemplate = {
  id: string;
  name: string;
  content: string; // Markdown content for the template
  tags?: string[]; // Optional tags for the template
  is_ai_generated?: boolean; // To distinguish AI-generated templates
};
