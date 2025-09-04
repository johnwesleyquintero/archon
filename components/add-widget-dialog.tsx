"use client";

import { Plus } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Widget } from "@/lib/types/widget-types";

interface AddWidgetDialogProps<P extends Record<string, unknown>> {
  availableWidgets: Widget<P>[];
  onAddWidget: (_widgetId: string) => void;
}

export function AddWidgetDialog<P extends Record<string, unknown>>({
  availableWidgets,
  onAddWidget,
}: AddWidgetDialogProps<P>) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredWidgets = availableWidgets.filter((widget: Widget<P>) =>
    widget.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-2 text-gray-600"
        >
          <Plus className="h-5 w-5" />
          <span>Add Widget</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Widget</DialogTitle>
          <DialogDescription>
            Select a widget to add to your dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="search"
            placeholder="Search widgets..."
            className="col-span-3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ScrollArea className="h-60 w-full rounded-md border">
            <div className="p-4">
              {filteredWidgets.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  No widgets found.
                </p>
              ) : (
                filteredWidgets.map((widget: Widget<P>) => (
                  <React.Fragment key={widget.id}>
                    <div className="flex items-center justify-between py-2">
                      <Label htmlFor={widget.id}>{widget.title}</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onAddWidget(widget.id);
                          setOpen(false);
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <Separator />
                  </React.Fragment>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
