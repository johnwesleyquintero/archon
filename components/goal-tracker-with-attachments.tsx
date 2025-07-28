"use client";

import Image from "next/image";
import {
  Calendar,
  Edit3,
  FileText,
  Paperclip,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { z } from "zod";

import { CreateGoalModal } from "@/components/create-goal-modal";
import { EmptyState } from "@/components/empty-state";
import { FileUpload } from "@/components/file-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useGoals } from "@/hooks/use-goals";
import { uploadFile } from "@/lib/blob";
import type { Database } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import type { goalSchema } from "@/lib/validators";

type Goal = Database["public"]["Tables"]["goals"]["Row"];

interface GoalTrackerProps {
  initialGoals?: Goal[];
}

type Attachment = {
  url: string;
  filename: string;
  type: "image" | "document";
};

const statusConfig = {
  pending: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "⚪ Not Started",
  },
  in_progress: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: "🟢 On Track",
  },
  completed: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "✅ Completed",
  },
};

export function GoalTrackerWithAttachments({ initialGoals }: GoalTrackerProps) {
  const {
    goals,
    isLoading,
    error,
    isMutating,
    addGoal,
    updateGoal,
    deleteGoal,
  } = useGoals(initialGoals);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUploadFor, setShowUploadFor] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleAddGoal = () => {
    setEditingGoal(null); // Ensure no old data when adding new
    setIsModalOpen(true);
  };

  const handleSaveOrUpdateGoal = async (
    goalData: z.infer<typeof goalSchema>,
    goalId?: string,
  ) => {
    if (goalId) {
      await updateGoal(goalId, {
        title: goalData.title,
        description: goalData.description || null,
        target_date: goalData.target_date || null,
        status: goalData.status || "pending",
        // Attachments are handled separately
      });
    } else {
      await addGoal({
        title: goalData.title,
        description: goalData.description || null,
        target_date: goalData.target_date || null,
        status: goalData.status || "pending",
        attachments: [],
      });
    }
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  // Helper function to convert a URL string to an Attachment object
  const createAttachmentFromUrl = (url: string): Attachment => {
    const fileExtension = url.substring(url.lastIndexOf(".") + 1).toLowerCase();
    const type: "image" | "document" = ["jpeg", "jpg", "gif", "png"].includes(
      fileExtension,
    )
      ? "image"
      : "document";
    return {
      url,
      filename: url.substring(url.lastIndexOf("/") + 1),
      type,
    };
  };

  const handleAttachmentUpload = async (file: File) => {
    if (!showUploadFor) return { success: false };

    try {
      // Upload to Vercel Blob
      const result = await uploadFile(file, `goals/${showUploadFor}`);

      if (result.success) {
        const currentGoal = goals.find((g) => g.id === showUploadFor);
        if (currentGoal) {
          const newAttachment: Attachment = {
            url: result.url,
            filename: file.name,
            type: file.type.startsWith("image/") ? "image" : "document",
          };
          // Convert existing string attachments to Attachment objects before adding new one
          const currentAttachmentsAsObjects: Attachment[] = Array.isArray(
            currentGoal.attachments,
          )
            ? currentGoal.attachments
                .filter((att): att is string => typeof att === "string")
                .map((att: string) => createAttachmentFromUrl(att))
            : [];

          const updatedAttachments: Attachment[] = [
            ...currentAttachmentsAsObjects,
            newAttachment,
          ];

          await updateGoal(showUploadFor, {
            attachments: updatedAttachments.map((att) => att.url), // Convert back to string[] for Supabase
          });
        }
        return { url: result.url, success: true };
      }

      return { success: false };
    } catch (err: unknown) {
      console.error("Error uploading file:", err);
      const errorToReturn = err instanceof Error ? err : new Error(String(err));
      return { success: false, error: errorToReturn };
    }
  };

  const toggleUploadFor = (goalId: string) => {
    setShowUploadFor(showUploadFor === goalId ? null : goalId);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      await deleteGoal(goalId);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-slate-600" />
            My Strategic Goals
          </CardTitle>
          <Button
            onClick={handleAddGoal}
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white"
            disabled={true} // Disable while loading
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New Goal
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="border border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full p-6 flex items-center justify-center bg-red-50 border-red-200 text-red-700">
        <p>Error: {error.message}</p>
      </Card>
    );
  }

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === "completed").length;
  const onTrackGoals = goals.filter((g) => g.status === "in_progress").length;

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-slate-600" />
            My Strategic Goals
          </CardTitle>
          <Button
            onClick={handleAddGoal}
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white"
            disabled={isMutating}
          >
            {isMutating ? (
              <Spinner size="sm" className="mr-1" />
            ) : (
              <Plus className="h-4 w-4 mr-1" />
            )}
            Add New Goal
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.length === 0 ? (
            <EmptyState
              title="No Goals Yet"
              description="Start by creating your first goal to track your progress."
              actionLabel="Create New Goal"
              onAction={handleAddGoal}
            />
          ) : (
            goals.map((goal) => (
              <Card
                key={goal.id}
                className="border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Goal Title and Status */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-slate-900 text-sm leading-tight">
                          {goal.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium shrink-0",
                            statusConfig[
                              goal.status as keyof typeof statusConfig
                            ]?.color,
                          )}
                        >
                          {
                            statusConfig[
                              goal.status as keyof typeof statusConfig
                            ]?.icon
                          }
                        </Badge>
                      </div>

                      {/* Target Date */}
                      {goal.target_date && (
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Due:{" "}
                            {new Date(goal.target_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {/* Description */}
                      {goal.description && (
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {goal.description}
                        </p>
                      )}

                      {/* Attachments */}
                      {Array.isArray(goal.attachments) &&
                        goal.attachments.length > 0 && (
                          <div className="pt-2">
                            <div className="flex items-center gap-1 text-xs text-slate-600 mb-2">
                              <Paperclip className="h-3 w-3" />
                              <span>
                                Attachments ({goal.attachments.length})
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {goal.attachments
                                .filter(
                                  (url): url is string =>
                                    typeof url === "string",
                                )
                                .map((url: string, index: number) => {
                                  const attachment =
                                    createAttachmentFromUrl(url);
                                  return attachment.type === "image" ? (
                                    <a
                                      key={index}
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="relative h-16 w-16 overflow-hidden rounded-md border border-slate-200"
                                    >
                                      <Image
                                        src={attachment.url}
                                        alt={attachment.filename}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                      />
                                    </a>
                                  ) : (
                                    <a
                                      key={index}
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded flex items-center gap-1"
                                    >
                                      <FileText className="h-3 w-3" />
                                      <span className="truncate max-w-[100px]">
                                        {attachment.filename}
                                      </span>
                                    </a>
                                  );
                                })}
                            </div>
                          </div>
                        )}

                      {/* File Upload */}
                      {showUploadFor === goal.id && (
                        <div className="pt-2">
                          <FileUpload
                            onUpload={handleAttachmentUpload}
                            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            buttonText="Add Attachment"
                            disabled={isMutating}
                          />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditGoal(goal)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
                        disabled={isMutating}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUploadFor(goal.id)}
                        className={cn(
                          "h-8 w-8 p-0 shrink-0",
                          showUploadFor === goal.id
                            ? "bg-slate-100 text-slate-700"
                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
                        )}
                        disabled={isMutating}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleDeleteGoal(goal.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-100 shrink-0"
                        disabled={isMutating}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Summary Stats */}
          {goals.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Total Goals</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {totalGoals}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Completed</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {completedGoals}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">On Track</p>
                  <p className="text-lg font-semibold text-green-600">
                    {onTrackGoals}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateGoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        onSaveOrUpdate={handleSaveOrUpdateGoal}
        isSaving={isMutating}
        initialData={editingGoal}
      />
    </>
  );
}
