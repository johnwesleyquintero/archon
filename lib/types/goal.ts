import { Database } from "@/lib/supabase/types";

export type Goal = Database["public"]["Tables"]["goals"]["Row"];
