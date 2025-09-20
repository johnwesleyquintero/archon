"use client";

import { FileText, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JournalTemplate } from "@/lib/types/journal";

interface JournalTemplateSelectorProps {
  onSelectTemplate: (_content: string) => void;
  onGenerateAiPrompt: (_currentContent: string) => Promise<string>;
  isLoadingAiPrompt: boolean;
  currentJournalContent: string;
}

export function JournalTemplateSelector({
  onSelectTemplate,
  onGenerateAiPrompt,
  isLoadingAiPrompt,
  currentJournalContent,
}: JournalTemplateSelectorProps) {
  const [templates] = useState<JournalTemplate[]>([
    {
      id: "daily-reflection",
      name: "Daily Reflection",
      content: `## Daily Reflection - ${new Date().toLocaleDateString()}

### What were my top 3 priorities today?
1. 
2. 
3. 

### What did I accomplish today?
- 

### What challenges did I face and how did I overcome them?
- 

### What am I grateful for today?
- 

### What could I have done better?
- 

### What are my priorities for tomorrow?
1. 
2. 
3. 
`,
    },
    {
      id: "weekly-review",
      name: "Weekly Review",
      content: `## Weekly Review - Week ending ${new Date().toLocaleDateString()}

### What were my key achievements this week?
- 

### What challenges did I encounter and how did I address them?
- 

### What did I learn this week?
- 

### How did I progress on my goals?
- 

### What adjustments do I need to make for next week?
- 
`,
    },
    {
      id: "goal-planning",
      name: "Goal Planning",
      content: `## Goal Planning

### Goal Title: 

### Why is this goal important to me?
- 

### What are the specific, measurable, achievable, relevant, and time-bound (SMART) objectives for this goal?
1. 
2. 
3. 

### What are the first few action steps I need to take?
1. 
2. 
3. 

### Potential obstacles and how to overcome them:
- 

### Resources needed:
- 
`,
    },
  ]);

  const handleAiPromptGeneration = async () => {
    try {
      const aiContent = await onGenerateAiPrompt(currentJournalContent);
      onSelectTemplate(aiContent);
      toast.success("AI prompt generated!");
    } catch (error) {
      console.error("Error generating AI prompt:", error);
      toast.error("Failed to generate AI prompt.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <FileText className="h-4 w-4" />
          Templates
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Journal Templates</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {templates.map((template) => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => onSelectTemplate(template.content)}
          >
            {template.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void handleAiPromptGeneration()}
          disabled={isLoadingAiPrompt}
          className="flex items-center gap-2"
        >
          {isLoadingAiPrompt ? (
            <Sparkles className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate AI Prompt
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
