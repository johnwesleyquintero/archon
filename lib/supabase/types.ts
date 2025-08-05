/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      dashboard_settings: {
        Row: {
          created_at: string;
          id: string;
          layout: Json | null;
          theme: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          layout?: Json | null;
          theme?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          layout?: Json | null;
          theme?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dashboard_settings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      goals: {
        Row: {
          attachments: Json | null;
          created_at: string;
          description: string | null;
          id: string;
          progress: number | null;
          status: string | null;
          target_date: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attachments?: Json | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          progress?: number | null;
          status?: string | null;
          target_date?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attachments?: Json | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          progress?: number | null;
          status?: string | null;
          target_date?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      journal_entries: {
        Row: {
          attachments: Json | null;
          content: string | null;
          created_at: string;
          id: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attachments?: Json | null;
          content?: string | null;
          created_at?: string;
          id?: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attachments?: Json | null;
          content?: string | null;
          created_at?: string;
          id?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          created_at: string;
          id: string;
          is_completed: boolean;
          title: string;
          updated_at: string;
          user_id: string;
          due_date: string | null;
          priority: "low" | "medium" | "high" | null;
          category: string | null;
          tags: string[] | null; // Assuming tags can be a JSON array of strings
          status: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_completed?: boolean;
          title: string;
          updated_at?: string;
          user_id: string;
          due_date?: string | null;
          priority?: "low" | "medium" | "high" | null;
          category?: string | null;
          tags?: string[] | null;
          status?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_completed?: boolean;
          title?: string;
          updated_at?: string;
          user_id?: string;
          due_date?: string | null;
          priority?: "low" | "medium" | "high" | null;
          category?: string | null;
          tags?: string[] | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;

export type ProfilesRow = Database["public"]["Tables"]["profiles"]["Row"];
export type TasksRow = Database["public"]["Tables"]["tasks"]["Row"];
export type GoalsRow = Database["public"]["Tables"]["goals"]["Row"];
export type JournalEntriesRow =
  Database["public"]["Tables"]["journal_entries"]["Row"];
export type DashboardSettingsRow =
  Database["public"]["Tables"]["dashboard_settings"]["Row"];

export type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"];
export type JournalEntryInsert =
  Database["public"]["Tables"]["journal_entries"]["Insert"];
export type JournalEntryUpdate =
  Database["public"]["Tables"]["journal_entries"]["Update"];
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];
