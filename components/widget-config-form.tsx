// File: components/widget-config-form.tsx
import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { WidgetConfig } from "@/lib/types/widget-types";

interface WidgetConfigFormProps {
  config: WidgetConfig;
  onSave: (newConfig: WidgetConfig) => void;
  onCancel: () => void;
}

export function WidgetConfigForm({
  config,
  onSave,
  onCancel,
}: WidgetConfigFormProps) {
  const [formData, setFormData] = useState<WidgetConfig>(config);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {Object.entries(formData).map(([key, value]) => {
        // Skip 'title' as it's usually handled by the widget itself or fixed
        if (key === "title") return null;

        return (
          <div key={key} className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={key} className="text-right capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </Label>
            {typeof value === "boolean" ? (
              <Switch
                id={key}
                checked={value}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, [key]: checked }))
                }
                className="col-span-3"
              />
            ) : (
              <Input
                id={key}
                type={typeof value === "number" ? "number" : "text"}
                value={value as string | number}
                onChange={handleChange}
                className="col-span-3"
              />
            )}
          </div>
        );
      })}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}
