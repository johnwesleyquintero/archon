export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      dashboard_settings: {
        Row: {
<<<<<<< HEAD
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
=======
          created_at: string
          id: string
          layout: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          layout?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          layout?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
>>>>>>> bf82e287a63e13247ad4b38263d2068fda55c2b9
          },
        ]
      }
      goals: {
        Row: {
<<<<<<< HEAD
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
=======
          completed: boolean
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
>>>>>>> bf82e287a63e13247ad4b38263d2068fda55c2b9
          },
        ]
      }
      journal_entries: {
        Row: {
<<<<<<< HEAD
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
=======
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
>>>>>>> bf82e287a63e13247ad4b38263d2068fda55c2b9
          },
        ]
      }
      profiles: {
        Row: {
<<<<<<< HEAD
          category: string | null;
          color: string | null;
          content: string | null;
          description: string | null;
          icon_name: string | null;
          id: string;
          name: string;
          title: string;
        };
        Insert: {
          category?: string | null;
          color?: string | null;
          content?: string | null;
          description?: string | null;
          icon_name?: string | null;
          id?: string;
          name: string;
          title: string;
        };
        Update: {
          category?: string | null;
          color?: string | null;
          content?: string | null;
          description?: string | null;
          icon_name?: string | null;
          id?: string;
          name?: string;
          title?: string;
        };
        Relationships: [];
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
=======
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
>>>>>>> bf82e287a63e13247ad4b38263d2068fda55c2b9
          },
        ]
      }
      tasks: {
        Row: {
<<<<<<< HEAD
          created_at: string;
          id: string;
          is_completed: boolean;
          title: string;
          updated_at: string;
          user_id: string;
          due_date: string | null;
          priority: "low" | "medium" | "high" | null;
          category: string | null;
          tags: Json | null; // Assuming tags can be a JSON array
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
          tags?: Json | null;
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
          tags?: Json | null;
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
=======
          category: string | null
          completed: boolean
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
>>>>>>> bf82e287a63e13247ad4b38263d2068fda55c2b9
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
<<<<<<< HEAD
      [_ in never]: never;
    };
  };
};
=======
      [_ in never]: never
    }
  }
}
>>>>>>> bf82e287a63e13247ad4b38263d2068fda55c2b9

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
<<<<<<< HEAD
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
=======
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    ? (Database["public"]["Tables"] & Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
>>>>>>> bf82e287a63e13247ad4b38263d2068fda55c2b9
      }
      ? R
      : never
    : never

export type TablesInsert<
<<<<<<< HEAD
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
=======
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
>>>>>>> bf82e287a63e13247ad4b38263d2068fda55c2b9
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
<<<<<<< HEAD
        Insert: infer I;
=======
        Insert: infer I
>>>>>>> bf82e287a63e13247ad4b38263d2068fda55c2b9
      }
      ? I
      : never
    : never

export type TablesUpdate<
<<<<<<< HEAD
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
=======
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
>>>>>>> bf82e287a63e13247ad4b38263d2068fda55c2b9
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
<<<<<<< HEAD
        Update: infer U;
=======
        Update: infer U
>>>>>>> bf82e287a63e13247ad4b38263d2068fda55c2b9
      }
      ? U
      : never
    : never

export type Enums<
<<<<<<< HEAD
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
=======
  PublicEnumNameOrOptions extends keyof Database["public"]["Enums"] | { schema: keyof Database },
>>>>>>> bf82e287a63e13247ad4b38263d2068fda55c2b9
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
<<<<<<< HEAD
    : never;

export type ProfilesRow = Database["public"]["Tables"]["profiles"]["Row"];
export type TasksRow = Database["public"]["Tables"]["tasks"]["Row"];
export type GoalsRow = Database["public"]["Tables"]["goals"]["Row"];
export type JournalEntriesRow =
  Database["public"]["Tables"]["journal_entries"]["Row"];
export type DashboardSettingsRow =
  Database["public"]["Tables"]["dashboard_settings"]["Row"];
=======
    : never
>>>>>>> bf82e287a63e13247ad4b38263d2068fda55c2b9
