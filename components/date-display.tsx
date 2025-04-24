"use client";

import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";

interface DateDisplayProps {
  date: Date;
  format?: string;
  relative?: boolean;
  className?: string;
  includeTime?: boolean;
}

/**
 * DateDisplay component for safely displaying formatted dates
 * 
 * This component prevents hydration errors by ensuring dates are
 * only rendered client-side, and adds proper formatting options.
 */
export function DateDisplay({
  date,
  format: formatString = "PP",
  relative = false,
  className,
  includeTime = false,
}: DateDisplayProps) {
  if (!date || isNaN(date.getTime())) {
    return <span className={cn("text-muted-foreground", className)}>Invalid date</span>;
  }

  if (relative) {
    let displayText = "";
    
    if (isToday(date)) {
      displayText = "Today";
      if (includeTime) {
        displayText += ` at ${format(date, "p")}`;
      }
    } else if (isYesterday(date)) {
      displayText = "Yesterday";
      if (includeTime) {
        displayText += ` at ${format(date, "p")}`;
      }
    } else {
      displayText = formatDistanceToNow(date, { addSuffix: true });
    }
    
    return <span className={className}>{displayText}</span>;
  }

  return <span className={className}>{format(date, formatString)}</span>;
} 