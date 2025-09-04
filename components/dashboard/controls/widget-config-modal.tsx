"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WidgetConfig, TodoWidgetConfig } from "@/lib/types/widget-types";

interface WidgetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: WidgetConfig) => void;
  currentConfig: WidgetConfig;
  widgetType: string;
}

export function WidgetConfigModal({
  isOpen,
  onClose,
  onSave,
  currentConfig,
  widgetType,
}: WidgetConfigModalProps) {
  // eslint-disable-next-line no-unused-vars
  const [config, setConfig] = useState(currentConfig);

  useEffect(() => {
    setConfig(currentConfig);
  }, [currentConfig]);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig((prevConfig) => ({ ...prevConfig, title: e.target.value }));
  };

  const handleFilterChange = (value: string) => {
    setConfig((prevConfig) => {
      const currentFilters = (prevConfig as TodoWidgetConfig).filters || {};
      return {
        ...prevConfig,
        filters: {
          ...currentFilters,
          status: value,
        },
      };
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Widget Configuration</DialogTitle>
          <DialogDescription>
            Make changes to your widget here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={config.title}
              onChange={handleTitleChange}
              className="col-span-3"
            />
          </div>
          {widgetType === "todo-list" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filter-status" className="text-right">
                Filter by Status
              </Label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue={
                  (config as TodoWidgetConfig).filters?.status || "all"
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
