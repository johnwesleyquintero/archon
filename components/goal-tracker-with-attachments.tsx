"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit3, Calendar, Target, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import { CreateGoalModal } from "@/components/create-goal-modal"
import { FileUpload } from "@/components/file-upload"
import { uploadFile } from "@/lib/blob"

interface Goal {
  id: string
  title: string
  targetDate: string
  status: "On Track" | "At Risk" | "Completed" | "Not Started"
  progress: number
  description?: string
  attachments?: Array<{
    url: string
    filename: string
    type: string
  }>
}

const statusConfig = {
  "On Track": { color: "bg-green-100 text-green-800 border-green-200", icon: "🟢" },
  "At Risk": { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "🟡" },
  Completed: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: "✅" },
  "Not Started": { color: "bg-gray-100 text-gray-800 border-gray-200", icon: "⚪" },
}

export function GoalTrackerWithAttachments() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Launch SaaS Product",
      targetDate: "Q4 2025",
      status: "On Track",
      progress: 65,
      description: "Complete MVP development and beta testing",
      attachments: [],
    },
    {
      id: "2",
      title: "Reach 10K Monthly Users",
      targetDate: "March 2025",
      status: "At Risk",
      progress: 30,
      description: "Focus on user acquisition and retention strategies",
      attachments: [],
    },
    {
      id: "3",
      title: "Complete Team Expansion",
      targetDate: "January 2025",
      status: "On Track",
      progress: 80,
      description: "Hire 5 new developers and 2 designers",
      attachments: [],
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [showUploadFor, setShowUploadFor] = useState<string | null>(null)

  const handleEditGoal = (goalId: string) => {
    setSelectedGoalId(goalId)
    // In a real app, you would open an edit modal here
  }

  const handleAddGoal = () => {
    setIsModalOpen(true)
  }

  const handleSaveGoal = (goalData: { title: string; description: string }) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: goalData.title,
      targetDate: "TBD",
      status: "Not Started",
      progress: 0,
      description: goalData.description,
      attachments: [],
    }
    setGoals([...goals, newGoal])
  }

  const handleAttachmentUpload = async (file: File) => {
    if (!showUploadFor) return { success: false }

    try {
      // Upload to Vercel Blob
      const result = await uploadFile(file, `goals/${showUploadFor}`)

      if (result.success) {
        // Determine file type category
        const fileType = file.type.startsWith("image/") ? "image" : "document"

        // Add to goal attachments
        setGoals(
          goals.map((goal) => {
            if (goal.id === showUploadFor) {
              const currentAttachments = goal.attachments || []
              return {
                ...goal,
                attachments: [
                  ...currentAttachments,
                  {
                    url: result.url,
                    filename: file.name,
                    type: fileType,
                  },
                ],
              }
            }
            return goal
          }),
        )

        return { url: result.url, success: true }
      }

      return { success: false }
    } catch (error) {
      console.error("Error uploading file:", error)
      return { success: false, error }
    }
  }

  const toggleUploadFor = (goalId: string) => {
    setShowUploadFor(showUploadFor === goalId ? null : goalId)
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-slate-600" />
            My Strategic Goals
          </CardTitle>
          <Button onClick={handleAddGoal} size="sm" className="bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="h-4 w-4 mr-1" />
            Add New Goal
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.id} className="border border-slate-200 hover:border-slate-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Goal Title and Status */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-slate-900 text-sm leading-tight">{goal.title}</h3>
                      <Badge
                        variant="outline"
                        className={cn("text-xs font-medium shrink-0", statusConfig[goal.status].color)}
                      >
                        <span className="mr-1">{statusConfig[goal.status].icon}</span>
                        {goal.status}
                      </Badge>
                    </div>

                    {/* Target Date */}
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <Calendar className="h-3 w-3" />
                      <span>Due: {goal.targetDate}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600">Progress</span>
                        <span className="text-xs font-medium text-slate-900">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>

                    {/* Description */}
                    {goal.description && <p className="text-xs text-slate-500 leading-relaxed">{goal.description}</p>}

                    {/* Attachments */}
                    {goal.attachments && goal.attachments.length > 0 && (
                      <div className="pt-2">
                        <div className="flex items-center gap-1 text-xs text-slate-600 mb-2">
                          <Paperclip className="h-3 w-3" />
                          <span>Attachments ({goal.attachments.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {goal.attachments.map((attachment, index) => (
                            <a
                              key={index}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded flex items-center gap-1"
                            >
                              <span className="truncate max-w-[100px]">{attachment.filename}</span>
                            </a>
                          ))}
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
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditGoal(goal.id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
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
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {goals.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-sm font-medium">No goals set yet</p>
              <p className="text-xs mt-1">Create your first strategic goal to get started</p>
            </div>
          )}

          {/* Summary Stats */}
          {goals.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Total Goals</p>
                  <p className="text-lg font-semibold text-slate-900">{goals.length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Completed</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {goals.filter((g) => g.status === "Completed").length}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">On Track</p>
                  <p className="text-lg font-semibold text-green-600">
                    {goals.filter((g) => g.status === "On Track").length}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">At Risk</p>
                  <p className="text-lg font-semibold text-yellow-600">
                    {goals.filter((g) => g.status === "At Risk").length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateGoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveGoal} />
    </>
  )
}
