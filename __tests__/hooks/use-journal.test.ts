import { renderHook, act, waitFor } from "@testing-library/react";
import { useJournal } from "@/hooks/use-journal";
import { useToast } from "@/hooks/use-toast";
import {
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "@/app/journal/actions";
import React from "react";

// Mock server actions
jest.mock("@/app/journal/actions");

// Mock Supabase client (not used for mutations anymore, but for subscriptions)
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  })),
}));

// Mock useToast hook
const mockToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock useTransition to be synchronous
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useTransition: () => [
    false,
    (callback: () => void) => {
      // Simulate asynchronous transition
      setTimeout(callback, 0);
    },
  ],
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
];

describe("useJournal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true);
  });

  it("adds a new journal entry successfully", async () => {
    const newEntry = {
      id: "new-entry-id",
      title: "New Entry",
      content: "",
      attachments: [],
      user_id: "user-123",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    (addJournalEntry as jest.Mock).mockResolvedValue(newEntry);

    const { result } = renderHook(() => useJournal([], "user-123"));

    await act(async () => {
      result.current.handleCreateEntry();
    });

    await waitFor(() => {
      expect(addJournalEntry).toHaveBeenCalledTimes(1);
      expect(result.current.entries[0]).toEqual(newEntry);
      expect(mockToast).toHaveBeenCalledWith({
        title: "Success!",
        description: "New journal entry created.",
      });
    });
  });

  it("handles add journal entry error", async () => {
    (addJournalEntry as jest.Mock).mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useJournal([], "user-123"));

    await act(async () => {
      result.current.handleCreateEntry();
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to create new journal entry.",
        variant: "destructive",
      });
    });
  });

  it("updates an existing journal entry successfully", async () => {
    const updatedEntry = { ...mockJournalEntries[0], title: "Updated" };
    (updateJournalEntry as jest.Mock).mockResolvedValue(updatedEntry);

    const { result } = renderHook(() =>
      useJournal(mockJournalEntries, "user-123"),
    );

    await act(async () => {
      result.current.setEntries((prev) =>
        prev.map((e) => (e.id === "entry-1" ? updatedEntry : e)),
      );
      result.current.setHasUnsavedChanges(true);
      result.current.handleSaveEntry();
    });

    await waitFor(() => {
      expect(updateJournalEntry).toHaveBeenCalledTimes(1);
      expect(mockToast).toHaveBeenCalledWith({
        title: "Success!",
        description: "Journal entry saved.",
      });
    });
  });

  it("handles update journal entry error", async () => {
    (updateJournalEntry as jest.Mock).mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() =>
      useJournal(mockJournalEntries, "user-123"),
    );

    await act(async () => {
      result.current.setHasUnsavedChanges(true);
      result.current.handleSaveEntry();
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to save journal entry.",
        variant: "destructive",
      });
    });
  });

  it("deletes a journal entry successfully", async () => {
    (deleteJournalEntry as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useJournal(mockJournalEntries, "user-123"),
    );

    await act(async () => {
      await result.current.handleDeleteEntry("entry-1");
    });

    await waitFor(() => {
      expect(deleteJournalEntry).toHaveBeenCalledWith("entry-1");
      expect(result.current.entries.length).toBe(0);
      expect(mockToast).toHaveBeenCalledWith({
        title: "Success!",
        description: "Journal entry deleted.",
      });
    });
  });

  it("handles delete journal entry error", async () => {
    (deleteJournalEntry as jest.Mock).mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() =>
      useJournal(mockJournalEntries, "user-123"),
    );

    await act(async () => {
      await result.current.handleDeleteEntry("entry-1");
    });

    await waitFor(() => {
      expect(result.current.entries.length).toBe(1); // Should not delete on error
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to delete journal entry.",
        variant: "destructive",
      });
    });
  });
});
