"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, PlusCircle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface JournalTagFilterProps {
  currentTags?: string[];
}

export function JournalTagFilter({ currentTags = [] }: JournalTagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTags, setSelectedTags] = useState<string[]>(currentTags);
  const [availableTags, setAvailableTags] = useState<string[]>([
    "productivity",
    "personal-growth",
    "ideas",
    "reflection",
    "gratitude",
    "health",
    "work",
    "learning",
  ]); // Example tags, in a real app these would come from a database
  const [newTagInput, setNewTagInput] = useState("");

  useEffect(() => {
    setSelectedTags(currentTags);
  }, [currentTags]);

  const handleTagToggle = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newSelectedTags);
    updateUrl(newSelectedTags);
  };

  const handleRemoveSelectedTag = (tagToRemove: string) => {
    const newSelectedTags = selectedTags.filter((t) => t !== tagToRemove);
    setSelectedTags(newSelectedTags);
    updateUrl(newSelectedTags);
  };

  const handleAddNewTag = () => {
    if (newTagInput.trim() && !availableTags.includes(newTagInput.trim())) {
      setAvailableTags((prev) => [...prev, newTagInput.trim()]);
    }
    if (newTagInput.trim() && !selectedTags.includes(newTagInput.trim())) {
      const newSelectedTags = [...selectedTags, newTagInput.trim()];
      setSelectedTags(newSelectedTags);
      updateUrl(newSelectedTags);
    }
    setNewTagInput("");
  };

  const updateUrl = (tags: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tags.length > 0) {
      params.delete("tags"); // Clear existing tags to avoid duplicates
      tags.forEach((tag) => params.append("tags", tag));
    } else {
      params.delete("tags");
    }
    router.push(`/journal?${params.toString()}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Tags
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {selectedTags.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Filter by Tags</h4>
            <p className="text-sm text-muted-foreground">
              Select tags to filter your journal entries.
            </p>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={`selected-${tag}`}
                variant="default"
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => handleRemoveSelectedTag(tag)}
              >
                {tag} <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
          <Separator />
          <div className="space-y-2">
            <h5 className="text-sm font-medium">Available Tags</h5>
            <ScrollArea className="h-32 w-full rounded-md border p-2">
              <div className="flex flex-wrap gap-2">
                {availableTags
                  .filter((tag) => !selectedTags.includes(tag))
                  .map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
              </div>
            </ScrollArea>
          </div>
          <Separator />
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Add new tag"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddNewTag();
                }
              }}
            />
            <Button size="sm" onClick={handleAddNewTag}>
              <PlusCircle className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
