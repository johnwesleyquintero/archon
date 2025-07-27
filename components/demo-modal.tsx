"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DemoModalProps {
  children: React.ReactNode;
}

export function DemoModal({ children }: DemoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Archon Demo</DialogTitle>
          <DialogDescription>
            Watch a quick overview of Archon's features.
          </DialogDescription>
        </DialogHeader>
        <div className="relative w-full aspect-video bg-black">
          {/* Placeholder for embedded video */}
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=example" // Replace with actual demo video URL
            title="Archon Demo Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          ></iframe>
        </div>
        <div className="p-6 pt-4 flex justify-end">
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
