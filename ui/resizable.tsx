"use client"

import { Resizable as ResizablePrimitive } from "re-resizable"
import * as React from "react"
import { GripVertical } from "lucide-react"

import { cn } from "@/lib/utils"

const Resizable = React.forwardRef<typeof ResizablePrimitive, React.ComponentProps<typeof ResizablePrimitive>>(
  ({ className, ...props }, ref) => (
    <ResizablePrimitive
      className={cn("relative", className)}
      {...props}
      ref={ref as React.RefObject<ResizablePrimitive>}
    />
  ),
)

const ResizableHandle = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 w-2.5 h-10 flex items-center justify-center bg-border rounded-sm group",
        className,
      )}
      {...props}
    >
      <GripVertical className="h-3.5 w-2.5 text-background group-hover:text-foreground transition-colors" />
    </div>
  ),
)

export { Resizable, ResizableHandle }
