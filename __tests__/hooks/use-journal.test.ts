import { renderHook, act, waitFor } from "@testing-library/react";
import { useJournal } from "@/hooks/use-journal";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Mock Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
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
            data: {
              id: "new-entry-id",
              title: "New Entry",
              content: "Content",
              attachments: [],
              user_id: "user-123",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
            },
            error: null,
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
        subscribe: jest.fn(),
      })),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  })),
}));

// Mock useToast hook
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));

const mockJournalEntries = [
  {
    id: "entry-1",
    title: "Entry 1",
    content: "Content 1",
    attachments: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    user_id: "user-123",
  },
  {
    id: "entry-2",
    title: "Entry 2",
    content: "Content 2",
    attachments: [],
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    user_id: "user-123",
  },
];

describe("useJournal", () => {
  let toast: jest.Mock<any, any>;
  let mockSupabaseFrom: jest.Mock<any, any>;

  beforeEach(() => {
    window.confirm = jest.fn(() => true);
    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    toast = mockToast;
    toast.mockClear();

    mockSupabaseFrom = (createClient as jest.Mock)().from;
    mockSupabaseFrom.mockClear();
  });

  it("fetches journal entries successfully", async () => {
    mockSupabaseFrom.mockReturnValue({
      select: () => ({
        order: () => ({
          data: mockJournalEntries,
          error: null,
        }),
      }),
    });

    const { result } = renderHook(() =>
      useJournal(mockJournalEntries, "user-123"),
    );

    await waitFor(() => expect(result.current.isMutating).toBe(false));
    expect(result.current.entries).toEqual(mockJournalEntries);
    // No direct error property on the hook's return, errors are handled via toast
  });

  it("handles fetch journal entries error", async () => {
    const fetchError = new Error("Failed to fetch entries");
    mockSupabaseFrom.mockReturnValue({
      select: () => ({
        order: () => ({
          data: null,
          error: fetchError,
        }),
      }),
    });

    const { result } = renderHook(() => useJournal([], "user-123"));

    await waitFor(() => expect(result.current.isMutating).toBe(false));
    expect(result.current.entries).toEqual([]);
    expect(toast).not.toHaveBeenCalled();
  });

  it("adds a new journal entry successfully", async () => {
    const returnedEntry = {
      id: "new-entry-id",
      title: "New Entry",
      content: "New Content",
      attachments: [],
      user_id: "user-123",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    mockSupabaseFrom.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: () => ({
            data: returnedEntry,
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useJournal([], "user-123"));

    await act(async () => {
      result.current.setHasUnsavedChanges(true);
      await result.current.handleCreateEntry();
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Success!",
        description: "New journal entry created.",
      }),
    );
  });

  it("handles add journal entry error", async () => {
    const insertError = new Error("Failed to insert entry");

    mockSupabaseFrom.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: () => ({
            data: null,
            error: insertError,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useJournal([], "user-123"));

    await act(async () => {
      await result.current.handleCreateEntry();
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error",
        description: "Failed to create new journal entry.",
        variant: "destructive",
      }),
    );
  });

  it("updates an existing journal entry successfully", async () => {
    const updatedEntryData = {
      title: "Updated Entry",
      content: "Updated Content",
      attachments: [],
    };

    const { result } = renderHook(() =>
      useJournal(mockJournalEntries, "user-123"),
    );

    await act(async () => {
      result.current.handleSelectEntry("entry-1");
      result.current.setHasUnsavedChanges(true);
      // Simulate updating the selected entry's content before saving
      result.current.setEntries((prev) =>
        prev.map((entry) =>
          entry.id === "entry-1" ? { ...entry, ...updatedEntryData } : entry,
        ),
      );
      await result.current.handleSaveEntry();
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Success!",
        description: "Journal entry saved.",
      }),
    );
    expect(result.current.entries[0]).toEqual(
      expect.objectContaining(updatedEntryData),
    );
  });

  it("handles update journal entry error", async () => {
    const updateError = new Error("Failed to update entry");

    mockSupabaseFrom.mockReturnValue({
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => ({
              data: null,
              error: updateError,
            }),
          }),
        }),
      }),
    });

    const { result } = renderHook(() =>
      useJournal(mockJournalEntries, "user-123"),
    );

    await act(async () => {
      result.current.handleSelectEntry("entry-1");
      result.current.setHasUnsavedChanges(true);
      // Simulate updating the selected entry's content before saving
      result.current.setEntries((prev) =>
        prev.map((entry) =>
          entry.id === "entry-1"
            ? { ...entry, content: "Simulated updated content" }
            : entry,
        ),
      );
      await result.current.handleSaveEntry();
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error",
        description: "Failed to save journal entry.",
        variant: "destructive",
      }),
    );
  });

  it("deletes a journal entry successfully", async () => {
    const entryId = "entry-1";

    mockSupabaseFrom.mockReturnValue({
      delete: () => ({
        eq: () => ({
          data: {},
          error: null,
        }),
      }),
    });

    const { result } = renderHook(() =>
      useJournal(mockJournalEntries, "user-123"),
    );

    await act(async () => {
      await result.current.handleDeleteEntry(entryId);
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Success!",
        description: "Journal entry deleted.",
      }),
    );
  });

  it("handles delete journal entry error", async () => {
    const entryId = "entry-1";
    const deleteError = new Error("Failed to delete entry");

    mockSupabaseFrom.mockReturnValue({
      delete: () => ({
        eq: () => ({
          data: null,
          error: deleteError,
        }),
      }),
    });

    const { result } = renderHook(() =>
      useJournal([{ ...mockJournalEntries[0] }], "user-123"),
    );

    await act(async () => {
      await result.current.handleDeleteEntry(entryId);
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Success!",
        description: "Journal entry deleted.",
      }),
    );
  });

  it("selects an entry when available", () => {
    const { result } = renderHook(() =>
      useJournal(mockJournalEntries, "user-123"),
    );

    expect(result.current.selectedEntry).toEqual(mockJournalEntries[0]);
    expect(result.current.selectedEntryId).toBe(mockJournalEntries[0].id);
  });

  it("allows selecting a different entry", () => {
    const { result } = renderHook(() =>
      useJournal(mockJournalEntries, "user-123"),
    );

    act(() => {
      result.current.handleSelectEntry(mockJournalEntries[1].id);
    });

    expect(result.current.selectedEntryId).toBe(mockJournalEntries[1].id);
    expect(result.current.selectedEntry).toEqual(mockJournalEntries[1]);
  });
});
