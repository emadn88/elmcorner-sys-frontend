import { cn } from "./utils";

/**
 * RTL-aware utility functions for conditional classes
 */

export function rtlClass(
  ltrClass: string,
  rtlClass: string,
  direction: "ltr" | "rtl"
): string {
  return direction === "rtl" ? rtlClass : ltrClass;
}

/**
 * Get margin start (left in LTR, right in RTL)
 */
export function marginStart(value: string, direction: "ltr" | "rtl"): React.CSSProperties {
  return direction === "rtl"
    ? { marginRight: value }
    : { marginLeft: value };
}

/**
 * Get margin end (right in LTR, left in RTL)
 */
export function marginEnd(value: string, direction: "ltr" | "rtl"): React.CSSProperties {
  return direction === "rtl"
    ? { marginLeft: value }
    : { marginRight: value };
}

/**
 * Get padding start (left in LTR, right in RTL)
 */
export function paddingStart(value: string, direction: "ltr" | "rtl"): React.CSSProperties {
  return direction === "rtl"
    ? { paddingRight: value }
    : { paddingLeft: value };
}

/**
 * Get padding end (right in LTR, left in RTL)
 */
export function paddingEnd(value: string, direction: "ltr" | "rtl"): React.CSSProperties {
  return direction === "rtl"
    ? { paddingLeft: value }
    : { paddingRight: value };
}

/**
 * Get left/right position based on direction
 */
export function positionStart(value: string, direction: "ltr" | "rtl"): React.CSSProperties {
  return direction === "rtl"
    ? { right: value }
    : { left: value };
}

/**
 * Get right/left position based on direction
 */
export function positionEnd(value: string, direction: "ltr" | "rtl"): React.CSSProperties {
  return direction === "rtl"
    ? { left: value }
    : { right: value };
}

/**
 * Combine classes with RTL-aware classes
 */
export function rtlAwareClasses(
  baseClasses: string,
  ltrClasses: string,
  rtlClasses: string,
  direction: "ltr" | "rtl"
): string {
  return cn(
    baseClasses,
    direction === "rtl" ? rtlClasses : ltrClasses
  );
}
