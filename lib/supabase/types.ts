export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  public: {
    Tables: {
      dashboard_settings: {
        Row: {
          created_at: string | null;
          id: string;
          layout: Json | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          layout?: Json | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          layout?: Json | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          attachments: Json | null;
          created_at: string;
          description: string | null;
          id: string;
          progress: number;
          status: string;
          target_date: string | null;
          title: string;
          tags: string[] | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attachments?: Json | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          progress?: number;
          status?: string;
          target_date?: string | null;
          title: string;
          tags?: string[] | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attachments?: Json | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          progress?: number;
          status?: string;
          target_date?: string | null;
          title?: string;
          tags?: string[] | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      journal_entries: {
        Row: {
          attachments: Json | null;
          content: string | null;
          created_at: string;
          id: string;
          tags: string[] | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attachments?: Json | null;
          content?: string | null;
          created_at?: string;
          id?: string;
          tags?: string[] | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attachments?: Json | null;
          content?: string | null;
          created_at?: string;
          id?: string;
          tags?: string[] | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      journal_templates: {
        Row: {
          content: string | null;
          created_at: string | null;
          id: string;
          title: string;
          user_id: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string | null;
          id?: string;
          title: string;
          user_id: string;
        };
        Update: {
          content?: string | null;
          created_at?: string | null;
          id?: string;
          title?: string;
          user_id?: string;
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
        Relationships: [];
      };
      tasks: {
        Row: {
          category: string | null;
          created_at: string;
          description: string | null;
          due_date: string | null;
          goal_id: string | null;
          id: string;
          is_completed: boolean;
          parent_id: string | null;
          position: number | null;
          status: Database["public"]["Enums"]["task_status"] | null;
          sort_order: number | null;
          tags: string[] | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          goal_id?: string | null;
          id?: string;
          is_completed?: boolean;
          parent_id?: string | null;
          position?: number | null;
          status?: Database["public"]["Enums"]["task_status"] | null;
          sort_order?: number | null;
          tags?: string[] | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          goal_id?: string | null;
          id?: string;
          is_completed?: boolean;
          parent_id?: string | null;
          position?: number | null;
          status?: Database["public"]["Enums"]["task_status"] | null;
          sort_order?: number | null;
          tags?: string[] | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "goals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      user_dashboard_settings: {
        Row: {
          created_at: string | null;
          id: string;
          settings: Json;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          settings: Json;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          settings?: Json;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      task_dependencies: {
        Row: {
          id: string;
          task_id: string;
          depends_on_task_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          depends_on_task_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          depends_on_task_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_dependencies_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_dependencies_depends_on_task_id_fkey";
            columns: ["depends_on_task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
      [_ in never]: never;
    };
    CompositeTypes: {
      // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
      [_ in never]: never;
    };
    Enums: {
      task_status: "todo" | "in_progress" | "done" | "canceled" | "archived";
    };
    Functions: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      task_priority: ["low", "medium", "high"],
    },
  },
} as const;
