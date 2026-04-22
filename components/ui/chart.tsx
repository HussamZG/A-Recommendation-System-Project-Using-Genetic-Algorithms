import * as React from "react"
import { cn } from "@/lib/utils"

// Chart container component for styling consistency
interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: Record<string, { label: string; color: string }>
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, children, config, ...props }, ref) => {
    // Generate CSS variables for chart colors
    const style = React.useMemo(() => {
      const styleObj: Record<string, string> = {}
      Object.entries(config).forEach(([key, value]) => {
        styleObj[`--color-${key}`] = value.color
      })
      return styleObj
    }, [config])

    return (
      <div
        ref={ref}
        className={cn("rounded-lg border bg-card", className)}
        style={style}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

export { ChartContainer }
export type { ChartContainerProps }
