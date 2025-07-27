// hooks/use-sidebar.ts
import { useState, useEffect } from 'react';

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Initialize from localStorage, defaulting to false if not found or on server
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  });

  useEffect(() => {
    // Persist state to localStorage whenever it changes
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(isCollapsed));
    }
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return { isCollapsed, toggleSidebar };
}
