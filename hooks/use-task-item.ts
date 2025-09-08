"use client";

import { useState } from "react";

import type { Task, TaskStatus } from "@/lib/types/task";
import { handleError } from "@/lib/utils";

export function useTaskItem({
  _id, // Prefixed as unused
  title,
  due_date,
  category,
  tags,
  status, // Added status
  onToggle,
  onDelete,
  onUpdate,
  disabled = false,
}: {
  _id: string; // Prefixed as unused
  title: string;
  due_date: string | null;

  category: string | null;
  tags: string[] | null;
  status: TaskStatus | null; // Added status type
  onToggle: (_id: string, _is_completed: boolean) => Promise<void>; // Prefixed as unused
  onDelete: (_id: string) => Promise<void>; // Prefixed as unused
  onUpdate: (_id: string, _updatedTask: Partial<Task>) => Promise<void>; // Prefixed as unused
  disabled?: boolean;
}) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [newDueDate, setNewDueDate] = useState(due_date);

  const [newCategory, setNewCategory] = useState(category);
  const [newTags, setNewTags] = useState(tags);
  const [newStatus, setNewStatus] = useState(status); // Added newStatus state

  const handleToggle = async (is_completed: boolean) => {
    if (disabled) return;
    setIsToggling(true);
    try {
      await onToggle(_id, is_completed);
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
      await onDelete(_id);
    } catch (error: unknown) {
      handleError(error, "useTaskItem:delete");
      // Optionally, show a toast notification
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    if (disabled) return;

    const updates: Partial<Task> = {};
    if (newTitle.trim() !== title) {
      updates.title = newTitle.trim();
    }
    if (newDueDate !== due_date) {
      updates.due_date = newDueDate;
    }

    if (newCategory !== category) {
      updates.category = newCategory;
    }
    if (newStatus !== status) {
      // Added status to updates
      updates.status = newStatus;
    }
    // Deep comparison for tags
    if (JSON.stringify(newTags) !== JSON.stringify(tags)) {
      updates.tags = newTags;
    }

    if (Object.keys(updates).length === 0) {
      setIsEditing(false);
      return; // No changes to update
    }

    setIsEditing(false);
    try {
      await onUpdate(_id, updates);
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
      setNewDueDate(due_date);

      setNewCategory(category);
      setNewTags(tags);
      setNewStatus(status); // Reset newStatus on escape
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
    newDueDate,
    setNewDueDate,

    newCategory,
    setNewCategory,
    newTags,
    setNewTags,
    newStatus, // Return newStatus
    setNewStatus, // Return setNewStatus
  };
}
