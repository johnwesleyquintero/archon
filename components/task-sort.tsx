"use client";

import React from "react";
import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { TaskSort } from "@/hooks/use-task-filters-and-sort";

interface TaskSortProps {
  sort: TaskSort;
  onSortChange: (sort: TaskSort) => void;
}

const sortOptions = [
  { value: "due_date", label: "Due Date" },
  { value: "priority", label: "Priority" },
  { value: "created_at", label: "Created" },
  { value: "updated_at", label: "Updated" },
  { value: "title", label: "Title" },
] as const;

export function TaskSort({ sort, onSortChange }: TaskSortProps) {
  const toggleDirection = () => {
    onSortChange({
      ...sort,
      direction: sort.direction === "asc" ? "desc" : "asc",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={sort.field}
        onValueChange={(value: TaskSort["field"]) =>
          onSortChange({ ...sort, field: value })
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
            sort.direction === "desc" ? "rotate-180" : ""
          }`}
        />
        <span className="sr-only">
          Sort {sort.direction === "asc" ? "descending" : "ascending"}
        </span>
      </Button>
    </div>
  );
}
