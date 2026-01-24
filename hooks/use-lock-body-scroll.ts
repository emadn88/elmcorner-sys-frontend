"use client";

import { useEffect } from "react";

/**
 * Hook to lock body scroll when dropdowns/modals are open
 */
export function useLockBodyScroll(lock: boolean) {
  useEffect(() => {
    if (lock) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [lock]);
}

