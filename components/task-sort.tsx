"use client";

import { ArrowUpDown } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskSortOptions } from "@/lib/database/tasks";

interface TaskSortProps {
  sort: TaskSortOptions;
  onSortChange: (sort: TaskSortOptions) => void;
}

const sortOptions = [
  { value: "due_date", label: "Due Date" },
  { value: "status", label: "Status" },
  { value: "created_at", label: "Created" },
  { value: "updated_at", label: "Updated" },
  { value: "title", label: "Title" },
  { value: "priority", label: "Priority" },
] as const;

export function TaskSort({ sort, onSortChange }: TaskSortProps) {
  const toggleDirection = () => {
    onSortChange({
      ...sort,
      sortOrder: sort.sortOrder === "asc" ? "desc" : "asc",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={sort.sortBy}
        onValueChange={(value) =>
          onSortChange({ ...sort, sortBy: value as TaskSortOptions["sortBy"] })
        }
      >
        <SelectTrigger className="h-8 w-[120px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={toggleDirection}
      >
        <ArrowUpDown
          className={`h-4 w-4 transition-transform ${
            sort.sortOrder === "desc" ? "rotate-180" : ""
          }`}
        />
        <span className="sr-only">
          Sort {sort.sortOrder === "asc" ? "descending" : "ascending"}
        </span>
      </Button>
    </div>
  );
}
