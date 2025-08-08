"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQuickAddJournal } from "@/lib/state/use-quick-add-journal";
import { addJournalEntry } from "@/app/journal/actions"; // Import the server action directly
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

export function QuickAddJournalModal() {
  const { isOpen, close } = useQuickAddJournal();
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
        close();
      }
    } catch {
      toast.error("Failed to create journal entry.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTitle("");
      setContent("");
    }
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Journal Entry</DialogTitle>
          <DialogDescription>
            Quickly capture your thoughts. You can add more details and
            attachments later.
          </DialogDescription>
        </DialogHeader>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSave()}
            disabled={!title || isSaving}
          >
            {isSaving ? "Saving..." : "Save Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
