import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react"

type HydrationStatus = "hydrated" | "dehydrating" | "alert"

interface StatusBadgeProps {
  status: HydrationStatus
  message: string
}

export function StatusBadge({ status, message }: StatusBadgeProps) {
  const getStyles = () => {
    switch (status) {
      case "hydrated":
        return {
          bg: "bg-[oklch(0.95_0.05_160)]",
          text: "text-[oklch(0.4_0.12_160)]",
          icon: CheckCircle2,
        }
      case "dehydrating":
        return {
          bg: "bg-[oklch(0.95_0.05_80)]",
          text: "text-[oklch(0.5_0.12_80)]",
          icon: AlertTriangle,
        }
      case "alert":
        return {
          bg: "bg-[oklch(0.95_0.06_25)]",
          text: "text-[oklch(0.5_0.15_25)]",
          icon: AlertCircle,
        }
    }
  }

  const styles = getStyles()
  const Icon = styles.icon

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${styles.bg}`}>
      <Icon className={`w-4 h-4 ${styles.text}`} />
      <span className={`text-sm font-medium ${styles.text}`}>{message}</span>
    </div>
  )
}
