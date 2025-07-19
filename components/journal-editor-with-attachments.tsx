"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Bold, Italic, List, Save, Paperclip, ImageIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { FileUpload } from "@/components/file-upload"
import { uploadFile } from "@/lib/blob"

interface JournalEntry {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  attachments?: Array<{
    url: string
    filename: string
    type: string
  }>
}

interface JournalEditorProps {
  entry: JournalEntry | null
  onUpdateEntry: (entryId: string, updates: Partial<JournalEntry>) => void
  onSaveEntry: () => void
  hasUnsavedChanges: boolean
}

export function JournalEditorWithAttachments({
  entry,
  onUpdateEntry,
  onSaveEntry,
  hasUnsavedChanges,
}: JournalEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [showAttachmentUpload, setShowAttachmentUpload] = useState(false)
  const [attachments, setAttachments] = useState<Array<{ url: string; filename: string; type: string }>>([])

  useEffect(() => {
    if (entry) {
      setTitle(entry.title)
      setContent(entry.content)
      setAttachments(entry.attachments || [])
    } else {
      setTitle("")
      setContent("")
      setAttachments([])
    }
  }, [entry])

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    if (entry) {
      onUpdateEntry(entry.id, { title: newTitle })
    }
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    if (entry) {
      onUpdateEntry(entry.id, { content: newContent })
    }
  }

  const insertMarkdown = (before: string, after = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end)

    handleContentChange(newContent)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const handleBold = () => insertMarkdown("**", "**")
  const handleItalic = () => insertMarkdown("*", "*")
  const handleBulletList = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const lineStart = content.lastIndexOf("\n", start - 1) + 1
    const newContent = content.substring(0, lineStart) + "- " + content.substring(lineStart)

    handleContentChange(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + 2, start + 2)
    }, 0)
  }

  const handleFileUpload = async (file: File) => {
    if (!entry) return { success: false }

    try {
      // Upload to Vercel Blob
      const result = await uploadFile(file, `journal/${entry.id}`)

      if (result.success) {
        // Determine file type category
        const fileType = file.type.startsWith("image/") ? "image" : "document"

        // Add to attachments
        const newAttachment = {
          url: result.url,
          filename: file.name,
          type: fileType,
        }

        const updatedAttachments = [...attachments, newAttachment]
        setAttachments(updatedAttachments)

        // Update entry
        onUpdateEntry(entry.id, {
          attachments: updatedAttachments,
        })

        return { url: result.url, success: true }
      }

      return { success: false }
    } catch (error) {
      console.error("Error uploading file:", error)
      return { success: false, error }
    }
  }

  const insertImageInContent = (url: string) => {
    insertMarkdown(`![Image](${url})`, "")
  }

  const removeAttachment = (url: string) => {
    if (!entry) return

    const updatedAttachments = attachments.filter((attachment) => attachment.url !== url)
    setAttachments(updatedAttachments)
    onUpdateEntry(entry.id, { attachments: updatedAttachments })

    // In a real app, you might want to also delete the file from blob storage
    // await deleteFile(url);
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!entry) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center text-slate-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
          <p className="text-sm font-medium">Select an entry to start writing</p>
          <p className="text-xs mt-1">Choose from your journal entries or create a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Entry title..."
              className="text-lg font-semibold border-0 px-0 shadow-none focus-visible:ring-0 placeholder:text-slate-400"
            />
            <p className="text-xs text-slate-500 mt-1">{formatDate(entry.createdAt)}</p>
          </div>
          <Button
            onClick={onSaveEntry}
            size="sm"
            disabled={!hasUnsavedChanges}
            className={cn(
              "transition-all duration-200",
              hasUnsavedChanges
                ? "bg-slate-900 hover:bg-slate-800 text-white"
                : "bg-slate-100 text-slate-400 cursor-not-allowed",
            )}
          >
            <Save className="h-4 w-4 mr-1" />
            {hasUnsavedChanges ? "Save" : "Saved"}
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleBold} className="h-8 w-8 p-0">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleItalic} className="h-8 w-8 p-0">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleBulletList} className="h-8 w-8 p-0">
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAttachmentUpload(!showAttachmentUpload)}
            className={cn("h-8 w-8 p-0", showAttachmentUpload && "bg-slate-100")}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <span className="text-xs text-slate-500">Use **bold**, *italic*, and - for lists</span>
        </div>

        {/* Attachment Upload */}
        {showAttachmentUpload && (
          <div className="pt-2">
            <FileUpload
              onUpload={handleFileUpload}
              accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              buttonText="Select File"
            />
          </div>
        )}

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-medium text-slate-700 mb-2">Attachments ({attachments.length})</p>
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.url}
                  className="group relative border border-slate-200 rounded-md p-1 hover:border-slate-300"
                >
                  {attachment.type === "image" ? (
                    <div className="relative w-16 h-16">
                      <img
                        src={attachment.url || "/placeholder.svg"}
                        alt={attachment.filename}
                        className="w-full h-full object-cover rounded"
                        onClick={() => insertImageInContent(attachment.url)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertImageInContent(attachment.url)}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white"
                        >
                          <ImageIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center">
                      <span className="text-xs text-slate-500 truncate max-w-[56px] px-1">
                        {attachment.filename.split(".").pop()}
                      </span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(attachment.url)}
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-white border border-slate-200 rounded-full opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 p-4">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start writing your thoughts..."
          className="w-full h-full resize-none border-0 shadow-none focus-visible:ring-0 text-base leading-relaxed placeholder:text-slate-400"
          style={{
            fontFamily: "ui-serif, Georgia, Cambria, serif",
            fontSize: "16px",
            lineHeight: "1.7",
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{content.length} characters</span>
          <span>Last updated: {entry.updatedAt.toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  )
}
