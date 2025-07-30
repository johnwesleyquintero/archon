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
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: "entry-1",
                title: "Updated Entry",
                content: "Updated Content",
                attachments: [],
                user_id: "user-123",
                created_at: "2024-01-01T00:00:00Z",
                updated_at: "2024-01-01T00:00:00Z",
              },
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
  let toast: jest.Mock;
  let mockSupabaseFrom: jest.Mock;

  beforeEach(() => {
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

    const { result } = renderHook(() => useJournal([], "user-123"));

    expect(result.current.isMutating).toBe(true);

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
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error fetching journal entries",
        description: fetchError.message,
        variant: "destructive",
      }),
    );
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

    expect(mockSupabaseFrom).toHaveBeenCalledWith("journal_entries");
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Success!",
        description: "Journal entry created.",
      }),
    );
  });

  it("handles add journal entry error", async () => {
    const newEntryData = {
      title: "New Entry",
      content: "New Content",
      attachments: [],
    };
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
      await result.current.addEntry(newEntryData);
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error",
        description: insertError.message,
        variant: "destructive",
      }),
    );
  });

  it("updates a journal entry successfully", async () => {
    const entryId = "entry-1";
    const updateData = {
      title: "Updated Entry",
      content: "Updated Content",
    };
    const updatedEntry = {
      id: entryId,
      title: "Updated Entry",
      content: "Updated Content",
      attachments: [],
      user_id: "user-123",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    mockSupabaseFrom.mockReturnValue({
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => ({
              data: updatedEntry,
              error: null,
            }),
          }),
        }),
      }),
    });

    const { result } = renderHook(() =>
      useJournal([{ ...mockJournalEntries[0] }], "user-123"),
    );

    await act(async () => {
      result.current.setSelectedEntryId(entryId);
      result.current.setHasUnsavedChanges(true);
      await result.current.handleSaveEntry();
    });

    expect(mockSupabaseFrom).toHaveBeenCalledWith("journal_entries");
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Success!",
        description: "Journal entry updated.",
      }),
    );
  });

  it("handles update journal entry error", async () => {
    const entryId = "entry-1";
    const updateData = {
      title: "Updated Entry",
      content: "Updated Content",
    };
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
      useJournal([{ ...mockJournalEntries[0] }], "user-123"),
    );

    await act(async () => {
      await result.current.updateEntry(entryId, updateData);
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error",
        description: updateError.message,
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
      useJournal([{ ...mockJournalEntries[0] }], "user-123"),
    );

    await act(async () => {
      await result.current.handleDeleteEntry(entryId);
    });

    expect(mockSupabaseFrom).toHaveBeenCalledWith("journal_entries");
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
        title: "Error",
        description: deleteError.message,
        variant: "destructive",
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
