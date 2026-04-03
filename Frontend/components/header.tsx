import { Droplet, Settings } from "lucide-react"

export function Header() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <Droplet className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">HydraClip</h1>
          <p className="text-xs text-muted-foreground">Real-time Monitoring</p>
        </div>
      </div>
      <button
        className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5 text-secondary-foreground" />
      </button>
    </header>
  )
}
