import React from "react"
import { GripVertical } from "lucide-react"
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels"

// Utility function to combine class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

const ResizablePanelGroup = ({
  className,
  ...props
}) => (
  <PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
)

const ResizablePanel = Panel

const ResizableHandle = ({
  withHandle = true,
  className,
  ...props
}) => (
  <PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors group",
      "data-[resize-handle-state=drag]:bg-blue-500",
      "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="absolute z-10 flex h-6 w-3 items-center justify-center rounded-sm bg-gray-300 group-hover:bg-gray-400 transition-colors">
        <GripVertical className="h-3 w-2.5 text-gray-600" />
      </div>
    )}
  </PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }