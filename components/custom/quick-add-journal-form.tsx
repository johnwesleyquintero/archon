"use client";

import { useState } from "react";
import { toast } from "sonner";

import { addJournalEntry } from "@/app/journal/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";

interface QuickAddJournalFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export function QuickAddJournalForm({
  onSave,
  onCancel,
}: QuickAddJournalFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to create an entry.");
      return;
    }
    if (!title) {
      toast.error("Title is required.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await addJournalEntry({
        title,
        content,
        user_id: user.id,
      });
      if (result && "error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Journal entry created!");
        setTitle("");
        setContent("");
        onSave();
      }
    } catch {
      toast.error("Failed to create journal entry.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <Input
        placeholder="Entry Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isSaving}
        autoFocus
      />
      <Textarea
        placeholder="Start writing..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSaving}
        rows={10}
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={() => void handleSave()} disabled={!title || isSaving}>
          {isSaving ? "Saving..." : "Save Entry"}
        </Button>
      </div>
    </div>
  );
}
