import { Droplets, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface AlertCardProps {
  type: "warning" | "urgent"
  message: string
}

export function AlertCard({ type, message }: AlertCardProps) {
  const isUrgent = type === "urgent"

  return (
    <Card
      className={`border-0 shadow-sm overflow-hidden ${
        isUrgent ? "bg-[oklch(0.97_0.03_25)]" : "bg-[oklch(0.97_0.025_80)]"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isUrgent ? "bg-[oklch(0.9_0.08_25)]" : "bg-[oklch(0.92_0.06_80)]"
            }`}
          >
            {isUrgent ? (
              <AlertCircle className="w-5 h-5 text-[oklch(0.5_0.18_25)]" />
            ) : (
              <Droplets className="w-5 h-5 text-[oklch(0.55_0.12_80)]" />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${
                isUrgent ? "text-[oklch(0.5_0.15_25)]" : "text-[oklch(0.55_0.1_80)]"
              }`}
            >
              {isUrgent ? "Urgent" : "Reminder"}
            </span>
            <p className={`text-sm ${isUrgent ? "text-[oklch(0.35_0.08_25)]" : "text-[oklch(0.4_0.05_80)]"}`}>
              {message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
