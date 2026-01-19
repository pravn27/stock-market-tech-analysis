import * as React from "react"
import { cn } from "../../lib/utils"

const TooltipProvider = ({ children }) => {
  return <>{children}</>
}

const TooltipContext = React.createContext(null)

const Tooltip = ({ children, open, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  
  return (
    <TooltipContext.Provider value={{ isOpen: open ?? isOpen, setIsOpen }}>
      <div className="relative inline-flex">
        {children}
      </div>
    </TooltipContext.Provider>
  )
}

const TooltipTrigger = React.forwardRef(({ className, children, asChild, ...props }, ref) => {
  const context = React.useContext(TooltipContext)
  
  return (
    <div
      ref={ref}
      className={cn("inline-flex", className)}
      onMouseEnter={() => context?.setIsOpen(true)}
      onMouseLeave={() => context?.setIsOpen(false)}
      {...props}
    >
      {children}
    </div>
  )
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef(({ className, sideOffset = 4, children, ...props }, ref) => {
  const context = React.useContext(TooltipContext)
  
  if (!context?.isOpen) return null
  
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 overflow-hidden rounded-md bg-slate-900 px-3 py-1.5 text-xs text-slate-50 animate-in fade-in-0 zoom-in-95 bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap shadow-lg",
        className
      )}
      {...props}
    >
      {children}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
    </div>
  )
})
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
