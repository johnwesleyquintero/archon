"use client";

import { useState } from "react";
import type { Task } from "@/lib/types/task";
import { handleError } from "@/lib/utils";

export function useTaskItem({
  id,
  title,
  onToggle,
  onDelete,
  onUpdate,
  disabled = false,
}: {
  id: string;
  title: string;
  onToggle: (id: string, is_completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updatedTask: Partial<Task>) => Promise<void>;
  disabled?: boolean;
}) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const handleToggle = async (is_completed: boolean) => {
    if (disabled) return;
    setIsToggling(true);
    try {
      await onToggle(id, is_completed);
    } catch (error: unknown) {
      handleError(error, "useTaskItem:toggle");
      // Optionally, show a toast notification
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (disabled) return;
    setIsDeleting(true);
    try {
      await onDelete(id);
    } catch (error: unknown) {
      handleError(error, "useTaskItem:delete");
      // Optionally, show a toast notification
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    if (disabled || newTitle.trim() === "" || newTitle.trim() === title) {
      setIsEditing(false);
      setNewTitle(title); // Reset if no change
      return;
    }
    setIsEditing(false);
    try {
      await onUpdate(id, { title: newTitle.trim() });
    } catch (error: unknown) {
      handleError(error, "useTaskItem:update");
      // Optionally, show a toast notification
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void handleUpdate();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setNewTitle(title);
    }
  };

  return {
    isToggling,
    isDeleting,
    isEditing,
    newTitle,
    setNewTitle,
    setIsEditing,
    handleToggle,
    handleDelete,
    handleUpdate,
    handleKeyDown,
  };
}
