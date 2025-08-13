"use client";

import { useEffect } from "react";

type ShortcutCallback = () => void;

export function useGlobalShortcut(
  key: string,
  callback: ShortcutCallback,
  metaKey: "ctrlKey" | "metaKey" = "metaKey",
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, callback, metaKey]);
}
