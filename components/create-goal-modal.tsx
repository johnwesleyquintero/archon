"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Modal } from "@/components/ui/modal"

interface CreateGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (goalData: { title: string; description: string }) => void
}

export function CreateGoalModal({ isOpen, onClose, onSave }: CreateGoalModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) return

    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onSave({
      title: title.trim(),
      description: description.trim(),
    })

    // Reset form
    setTitle("")
    setDescription("")
    setIsSaving(false)
    onClose()
  }

  const handleCancel = () => {
    setTitle("")
    setDescription("")
    onClose()
  }

  const isFormValid = title.trim().length > 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Create New Goal"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid || isSaving} className="bg-slate-900 hover:bg-slate-800">
            {isSaving ? "Saving..." : "Save Goal"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="goal-title" className="text-sm font-medium text-slate-700">
            Goal Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="goal-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your goal title"
            className="h-10"
            disabled={isSaving}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal-description" className="text-sm font-medium text-slate-700">
            Description
          </Label>
          <Textarea
            id="goal-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your goal in detail..."
            className="min-h-[100px] resize-none"
            disabled={isSaving}
          />
          <p className="text-xs text-slate-500">
            Optional: Add more details about your goal and how you plan to achieve it.
          </p>
        </div>
      </div>
    </Modal>
  )
}
