"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  isMounted: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Load preference from localStorage
    const saved = localStorage.getItem("sidebar-open");
    if (saved !== null) {
      setIsOpen(JSON.parse(saved));
    } else {
      // On mobile, default to closed; on desktop, default to open
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      setIsOpen(!isMobile);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("sidebar-open", JSON.stringify(isOpen));
    }
  }, [isOpen, isMounted]);

  const toggle = () => setIsOpen((prev) => !prev);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, open, close, isMounted }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

