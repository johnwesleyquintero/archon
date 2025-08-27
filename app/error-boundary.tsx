"use client";

import { Copy, RefreshCw, Terminal } from "lucide-react";
import React from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null; // <-- Store component stack here
  isPromptCopied: boolean; // <-- For copy button feedback
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isPromptCopied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service here
    console.error("Error caught by boundary:", error, errorInfo);
    // We store the errorInfo in the state to use it in the render method
    this.setState({ errorInfo });
  }

  private reloadPage = () => {
    window.location.reload();
  };

  private generateAIPrompt = (): string => {
    if (!this.state.error) return "No error details available.";

    const { error, errorInfo } = this.state;

    return `
I'm encountering an error in my React application built with Next.js/TypeScript. Please help me identify the likely cause and suggest a solution.

Here are the details captured by my Error Boundary:

**1. Error Message:**
\`\`\`
${error.message}
\`\`\`

**2. Error Stack Trace:**
\`\`\`
${error.stack || "No stack trace available."}
\`\`\`

**3. React Component Stack:**
This shows which component threw the error.
\`\`\`
${errorInfo?.componentStack || "No component stack available."}
\`\`\`

Based on this information, what is the most probable cause of this error? Please provide a code example demonstrating how to fix the issue in the relevant component.
    `;
  };

  private handleCopyPrompt = () => {
    const prompt = this.generateAIPrompt();
    void navigator.clipboard.writeText(prompt);
    this.setState({ isPromptCopied: true });
    setTimeout(() => this.setState({ isPromptCopied: false }), 2000); // Reset after 2s
  };

  render() {
    if (this.state.hasError) {
      // --- DEVELOPMENT-ONLY RENDER ---
      // This gives you maximum debug information without scaring production users
      if (process.env.NODE_ENV === "development") {
        return (
          <div className="container mx-auto max-w-4xl p-4 font-sans">
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle className="text-xl font-bold">
                Application Error
              </AlertTitle>
              <AlertDescription>
                An error was caught by the Error Boundary.
              </AlertDescription>
            </Alert>

            <div className="mt-4 rounded-md border bg-card p-4 text-card-foreground">
              <h3 className="mb-2 text-lg font-semibold text-destructive">
                {this.state.error?.message}
              </h3>
              {this.state.errorInfo?.componentStack && (
                <details className="mt-2 cursor-pointer rounded-md bg-muted p-3">
                  <summary className="font-medium text-muted-foreground">
                    View Component Stack
                  </summary>
                  <pre className="mt-2 overflow-x-auto whitespace-pre-wrap pt-2 text-sm">
                    <code>{this.state.errorInfo.componentStack}</code>
                  </pre>
                </details>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold">AI Assistant Prompt</h3>
              <p className="text-sm text-muted-foreground">
                Copy this prompt and paste it into your AI agent to get help.
              </p>
              <div className="relative mt-2">
                <pre className="max-h-60 overflow-auto rounded-md bg-muted p-4 text-sm">
                  <code>{this.generateAIPrompt()}</code>
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute right-2 top-2"
                  onClick={this.handleCopyPrompt}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {this.state.isPromptCopied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <Button onClick={this.reloadPage}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Page
              </Button>
            </div>
          </div>
        );
      }

      // --- PRODUCTION / USER-FACING RENDER ---
      // This is clean, simple, and safe to show to end-users.
      const isChunkError = this.state.error?.name === "ChunkLoadError";

      return (
        this.props.fallback || (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-4 text-center">
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="max-w-md text-muted-foreground">
              {isChunkError
                ? "A new version of the site is available. Please reload the page."
                : "An unexpected error occurred. Please try reloading the page."}
            </p>
            <Button onClick={this.reloadPage}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
