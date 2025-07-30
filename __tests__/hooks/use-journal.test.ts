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
    const newEntryData = {
      title: "New Entry",
      content: "New Content",
      attachments: [],
    };
    const returnedEntry = {
      id: "new-entry-id",
      ...newEntryData,
      user_id: "user-123",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }; // Add user_id, created_at, updated_at for consistency

    mockSupabaseFrom.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: () => ({
            data: returnedEntry,
            error: null,
          }),
        }),
      }),
      select: () => ({
        order: () => ({
          data: [...mockJournalEntries, returnedEntry], // Simulate refetch after insert
          error: null,
        }),
      }),
    });

    const { result } = renderHook(() =>
      useJournal(mockJournalEntries, "user-123"),
    );
    await waitFor(() => expect(result.current.isMutating).toBe(false)); // Wait for initial fetch

    await act(async () => {
      await result.current.handleCreateEntry(); // Call handleCreateEntry
    });

    expect(mockSupabaseFrom().insert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: newEntryData.title,
        content: newEntryData.content,
        attachments: newEntryData.attachments,
        user_id: "user-123",
      }),
    );
    expect(result.current.entries).toEqual([
      ...mockJournalEntries,
      returnedEntry,
    ]);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Success!",
        description: "New journal entry created.",
      }),
    );
  });

  it("handles add journal entry error", async () => {
    const addError = new Error("Failed to add entry");
    mockSupabaseFrom.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: () => ({
            data: null,
            error: addError,
          }),
        }),
      }),
      select: () => ({
        order: () => ({
          data: mockJournalEntries, // Simulate no change after failed insert
          error: null,
        }),
      }),
    });

    const { result } = renderHook(() =>
      useJournal(mockJournalEntries, "user-123"),
    );
    await waitFor(() => expect(result.current.isMutating).toBe(false)); // Wait for initial fetch

    await act(async () => {
      await result.current.handleCreateEntry(); // Call handleCreateEntry
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error",
        description: "Failed to create new journal entry.",
        variant: "destructive",
      }),
    );
    expect(result.current.entries).toEqual(mockJournalEntries); // Entries should not change
  });

  it("updates an existing journal entry successfully", async () => {
    const updatedEntryData = { title: "Updated Entry", content: "New Content" };
    const updatedEntry = {
      ...mockJournalEntries[0],
      ...updatedEntryData,
      updated_at: new Date().toISOString(),
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
      select: () => ({
        order: () => ({
          data: [updatedEntry, mockJournalEntries[1]], // Simulate refetch after update
          error: null,
        }),
      }),
    });

    const { result } = renderHook(() =>
      useJournal(mockJournalEntries, "user-123"),
    );
    await waitFor(() => expect(result.current.isMutating).toBe(false)); // Wait for initial fetch

    // Set selected entry and unsaved changes to simulate a save action
    act(() => {
      result.current.handleSelectEntry("entry-1");
      result.current.setHasUnsavedChanges(true);
      // Manually update the entry in the state to simulate user input
      result.current.setEntries((prev) =>
        prev.map((e) =>
          e.id === "entry-1"
            ? {
                ...e,
                ...updatedEntryData,
                updated_at: new Date().toISOString(),
              }
            : e,
        ),
      );
    });

    await act(async () => {
      await result.current.handleSaveEntry(); // Call handleSaveEntry
    });

    expect(mockSupabaseFrom().update).toHaveBeenCalledWith(updatedEntryData);
    expect(mockSupabaseFrom().update().eq).toHaveBeenCalledWith(
      "id",
      "entry-1",
    );
    expect(result.current.entries).toEqual([
      updatedEntry,
      mockJournalEntries[1],
    ]);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Success!",
        description: "Journal entry saved.",
      }),
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
      select: () => ({
        order: () => ({
          data: mockJournalEntries, // Simulate no change after failed update
          error: null,
        }),
      }),
    });

    const { result } = renderHook(() =>
      useJournal(mockJournalEntries, "user-123"),
    );
    await waitFor(() => expect(result.current.isMutating).toBe(false)); // Wait for initial fetch

    // Set selected entry and unsaved changes to simulate a save action
    act(() => {
      result.current.handleSelectEntry("entry-1");
      result.current.setHasUnsavedChanges(true);
      // Manually update the entry in the state to simulate user input
      result.current.setEntries((prev) =>
        prev.map((e) =>
          e.id === "entry-1"
            ? {
                ...e,
                title: "Invalid Update",
                updated_at: new Date().toISOString(),
              }
            : e,
        ),
      );
    });

    await act(async () => {
      await result.current.handleSaveEntry(); // Call handleSaveEntry
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error",
        description: "Failed to save journal entry.",
        variant: "destructive",
      }),
    );
    expect(result.current.entries).toEqual(mockJournalEntries); // Entries should not change
  });

  it("deletes a journal entry successfully", async () => {
    mockSupabaseFrom.mockReturnValue({
      delete: () => ({
        eq: () => ({
          data: {},
          error: null,
        }),
      }),
      select: () => ({
        order: () => ({
          data: [mockJournalEntries[1]], // Simulate refetch after delete
          error: null,
        }),
      }),
    });

    const { result } = renderHook(() =>
      useJournal(mockJournalEntries, "user-123"),
    );
    await waitFor(() => expect(result.current.isMutating).toBe(false)); // Wait for initial fetch

    // Mock window.confirm
    jest.spyOn(window, "confirm").mockReturnValue(true);

    await act(async () => {
      await result.current.handleDeleteEntry("entry-1"); // Call handleDeleteEntry
    });

    expect(mockSupabaseFrom().delete).toHaveBeenCalled();
    expect(mockSupabaseFrom().delete().eq).toHaveBeenCalledWith(
      "id",
      "entry-1",
    );
    expect(result.current.entries).toEqual([mockJournalEntries[1]]);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Success!",
        description: "Journal entry deleted.",
      }),
    );
    jest.spyOn(window, "confirm").mockRestore(); // Restore original confirm
  });

  it("handles delete journal entry error", async () => {
    const deleteError = new Error("Failed to delete entry");
    mockSupabaseFrom.mockReturnValue({
      delete: () => ({
        eq: () => ({
          data: null,
          error: deleteError,
        }),
      }),
      select: () => ({
        order: () => ({
          data: mockJournalEntries, // Simulate no change after failed delete
          error: null,
        }),
      }),
    });

    const { result } = renderHook(() =>
      useJournal(mockJournalEntries, "user-123"),
    );
    await waitFor(() => expect(result.current.isMutating).toBe(false)); // Wait for initial fetch

    // Mock window.confirm
    jest.spyOn(window, "confirm").mockReturnValue(true);

    await act(async () => {
      await result.current.handleDeleteEntry("non-existent-entry"); // Call handleDeleteEntry
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error",
        description: "Failed to delete journal entry.", // The hook's toast message for delete error
        variant: "destructive",
      }),
    );
    expect(result.current.entries).toEqual(mockJournalEntries); // Entries should not change
    jest.spyOn(window, "confirm").mockRestore(); // Restore original confirm
  });
});
