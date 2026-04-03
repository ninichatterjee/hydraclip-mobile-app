"use client"

interface HydrationScoreProps {
  score: number
}

export function HydrationScore({ score }: HydrationScoreProps) {
  const percentage = score * 100
  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getScoreColor = () => {
    if (score >= 0.7) return "stroke-[oklch(0.7_0.15_160)]"
    if (score >= 0.4) return "stroke-[oklch(0.75_0.15_80)]"
    return "stroke-[oklch(0.6_0.18_25)]"
  }

  const getTextColor = () => {
    if (score >= 0.7) return "text-[oklch(0.55_0.12_160)]"
    if (score >= 0.4) return "text-[oklch(0.6_0.12_80)]"
    return "text-[oklch(0.5_0.15_25)]"
  }

  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="70" fill="none" className="stroke-muted" strokeWidth="12" />
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          className={`${getScoreColor()} transition-all duration-500`}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${getTextColor()} transition-colors duration-300`}>
          {score.toFixed(2)}
        </span>
        <span className="text-sm text-muted-foreground font-medium">Hydration Level</span>
      </div>
    </div>
  )
}
