"use client";

import React, { useState, useEffect, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { WidgetConfig } from "@/lib/types/widget-types";

type FormFieldType = "text" | "number" | "switch" | "select";

interface FormField {
  key: string;
  label: string;
  type: FormFieldType;
  options?: { value: string; label: string }[]; // For select type
}

interface AdvancedWidgetConfigFormProps {
  config: WidgetConfig;
  onSave: (newConfig: WidgetConfig) => void;
  onCancel: () => void;
  formFields: FormField[];
}

export function AdvancedWidgetConfigForm({
  config,
  onSave,
  onCancel,
  formFields,
}: AdvancedWidgetConfigFormProps) {
  const [formData, setFormData] = useState<WidgetConfig>(config);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [id]: type === "checkbox" ? checked : value,
      }));
    },
    [],
  );

  const handleSwitchChange = useCallback((key: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [key]: checked }));
  }, []);

  const handleSelectChange = useCallback((key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderField = (field: FormField) => {
    const value = formData[field.key];

    switch (field.type) {
      case "switch":
        return (
          <Switch
            id={field.key}
            checked={!!value}
            onCheckedChange={(checked) =>
              handleSwitchChange(field.key, checked)
            }
            className="col-span-3"
          />
        );
      case "select":
        return (
          <Select
            value={String(value)}
            onValueChange={(newValue) =>
              handleSelectChange(field.key, newValue)
            }
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "number":
        return (
          <Input
            id={field.key}
            type="number"
            value={value as number}
            onChange={handleInputChange}
            className="col-span-3"
          />
        );
      case "text":
      default:
        return (
          <Input
            id={field.key}
            type="text"
            value={value as string}
            onChange={handleInputChange}
            className="col-span-3"
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formFields.map((field) => (
        <div key={field.key} className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={field.key} className="text-right">
            {field.label}
          </Label>
          {renderField(field)}
        </div>
      ))}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}
