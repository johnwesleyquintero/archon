import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorStateProps {
  message: string
  description?: string
}

export function ErrorState({ message, description }: ErrorStateProps) {
  return (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {message}
          {description && <p className="mt-1 text-sm">{description}</p>}
        </AlertDescription>
      </Alert>
    </div>
  )
}
