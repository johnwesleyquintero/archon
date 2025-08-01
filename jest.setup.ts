// @ts-nocheck
import "@testing-library/jest-dom";
import * as React from "react";
import { TextEncoder, TextDecoder } from "util"; // Node.js 'util' module for polyfill
import ResizeObserverPolyfill from "resize-observer-polyfill";
import nodeFetch from "node-fetch";
import FormData from "form-data";

// Mock ResizeObserver
global.ResizeObserver = ResizeObserverPolyfill;

// Polyfill TextEncoder and TextDecoder for Jest JSDOM environment
// These are global APIs expected in browser/Node.js environments but missing in JSDOM by default.
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill Web APIs for Jest JSDOM environment
// These are global APIs expected in browser environments but missing in JSDOM by default.
// They are often used by Next.js and other libraries.
if (typeof globalThis.Request === "undefined") {
  globalThis.Request = nodeFetch.Request;
}
if (typeof globalThis.Response === "undefined") {
  globalThis.Response = nodeFetch.Response;
}
if (typeof globalThis.Headers === "undefined") {
  globalThis.Headers = nodeFetch.Headers;
}
if (typeof globalThis.FormData === "undefined") {
  globalThis.FormData = FormData;
}

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-service-role-key";
process.env.SUPABASE_ACCESS_TOKEN = "mock-access-token";
process.env.BLOB_READ_WRITE_TOKEN = "mock-blob-token";
process.env.GROQ_API_KEY = "mock-groq-api-key";

// Mock auth context
jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(() => ({
    user: { id: "test-user-id" },
    profile: { id: "test-user-id", name: "Test User" },
    session: { user: { id: "test-user-id" } },
    loading: false,
    error: null,
    signOut: jest.fn().mockResolvedValue({ error: null }),
    refreshProfile: jest.fn().mockResolvedValue(undefined),
    updateProfile: jest.fn().mockResolvedValue({ error: null }),
    isSigningOut: false,
    setIsSigningOut: jest.fn(),
  })),
}));

// Mock toast hooks
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
    dismiss: jest.fn(),
    toasts: [],
  })),
}));

jest.mock("@/components/ui/use-toast", () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
    dismiss: jest.fn(),
    toasts: [],
  })),
}));

// Mock server-side Supabase client
jest.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: null,
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null,
          })),
        })),
        order: jest.fn(() => ({
          data: [],
          error: null,
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: "new-item-id" },
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: "updated-item-id" },
              error: null,
            })),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: {},
          error: null,
        })),
      })),
    })),
  })),
}));

// Mock client-side Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: null,
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null,
          })),
        })),
        order: jest.fn(() => ({
          data: [],
          error: null,
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: "new-item-id" },
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: "updated-item-id" },
              error: null,
            })),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: {},
          error: null,
        })),
      })),
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(() => ({})),
      })),
    })),
    removeChannel: jest.fn(),
  })),
}));

// Mock database functions
jest.mock("@/lib/database/tasks", () => ({
  getTasks: jest.fn().mockResolvedValue([]),
  addTask: jest.fn().mockResolvedValue({ id: "new-task-id" }),
  toggleTask: jest.fn().mockResolvedValue({ id: "toggled-task-id" }),
  deleteTask: jest.fn().mockResolvedValue({}),
  updateTask: jest.fn().mockResolvedValue({ id: "updated-task-id" }),
}));

jest.mock("@/lib/database/goals", () => ({
  getGoals: jest.fn().mockResolvedValue([]),
  addGoal: jest.fn().mockResolvedValue({ id: "new-goal-id" }),
  updateGoal: jest.fn().mockResolvedValue({ id: "updated-goal-id" }),
  deleteGoal: jest.fn().mockResolvedValue({}),
}));

jest.mock("@/lib/database/journal", () => ({
  getJournalEntries: jest.fn().mockResolvedValue([]),
  addJournalEntry: jest.fn().mockResolvedValue({ id: "new-journal-id" }),
  updateJournalEntry: jest.fn().mockResolvedValue({ id: "updated-journal-id" }),
  deleteJournalEntry: jest.fn().mockResolvedValue({}),
}));

// Mock task hooks
jest.mock("@/hooks/use-tasks", () => ({
  useTasks: jest.fn(() => ({
    tasks: [],
    loading: false,
    error: null,
    addTask: jest.fn().mockResolvedValue({ id: "new-task-id" }),
    toggleTask: jest.fn().mockResolvedValue({ id: "toggled-task-id" }),
    deleteTask: jest.fn().mockResolvedValue({}),
    updateTask: jest.fn().mockResolvedValue({ id: "updated-task-id" }),
    isMutating: false,
    refreshTasks: jest.fn(),
  })),
}));

jest.mock("@/hooks/use-task-filters-and-sort", () => ({
  useTaskFiltersAndSort: jest.fn(() => ({
    filteredAndSortedTasks: [],
    sort: { field: "created_at", direction: "desc" },
    setSort: jest.fn(),
    filters: {
      status: "all",
      priority: "all",
      dueDate: "all",
      category: null,
      tags: [],
    },
    setFilters: jest.fn(),
  })),
}));

jest.mock("@/hooks/use-task-item", () => ({
  useTaskItem: jest.fn(({ id, title, onToggle, onDelete, onUpdate }) => ({
    isToggling: false,
    isDeleting: false,
    isEditing: false,
    newTitle: title,
    setNewTitle: jest.fn(),
    setIsEditing: jest.fn(),
    handleToggle: jest.fn((checked) => onToggle(id, checked)),
    handleDelete: jest.fn(() => onDelete(id)),
    handleUpdate: jest.fn(() => onUpdate(id, title)),
    handleKeyDown: jest.fn(),
  })),
}));

// Mock React.act for @testing-library/react-hooks compatibility with React 19
// This ensures that act from React is used, addressing the deprecation warning.
// This might not be strictly necessary after removing @testing-library/react-hooks,
// but it's good practice to ensure act is correctly handled globally.
global.IS_REACT_ACT_ENVIRONMENT = true;
global.act = React.act;
