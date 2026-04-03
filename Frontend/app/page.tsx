"use client"

import { useState, useCallback, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { HydrationScore } from "@/components/hydration-score"
import { HydrationChart } from "@/components/hydration-chart"
import { StatusBadge } from "@/components/status-badge"
import { AlertCard } from "@/components/alert-card"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Droplets } from "lucide-react"

type HydrationStatus = "hydrated" | "dehydrating" | "alert"

interface DataPoint {
  time: string
  value: number
  forecast?: number
}


function calculateTrend(data: DataPoint[]): number {
  if (data.length < 2) return 0
  
  const recentData = data.slice(-5)
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0
  const n = recentData.length
  
  recentData.forEach((point, index) => {
    sumX += index
    sumY += point.value
    sumXY += index * point.value
    sumX2 += index * index
  })
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  return slope
}

function generateForecast(data: DataPoint[], numPoints: number = 3): DataPoint[] {
  if (data.length === 0) return []
  
  const trend = calculateTrend(data)
  const lastValue = data[data.length - 1].value
  const forecastPoints: DataPoint[] = []
  
  for (let i = 1; i <= numPoints; i++) {
    const forecastValue = Math.max(0, Math.min(1, lastValue + trend * i))
    forecastPoints.push({
      time: `+${i * 10}m`,
      value: lastValue,
      forecast: forecastValue,
    })
  }
  
  return forecastPoints
}

function getStatus(score: number): HydrationStatus {
  if (score >= 0.7) return "hydrated"
  if (score >= 0.4) return "dehydrating"
  return "alert"
}

function getStatusMessage(status: HydrationStatus): string {
  switch (status) {
    case "hydrated":
      return "Well Hydrated"
    case "dehydrating":
      return "Dehydrating"
    case "alert":
      return "Hydration Alert"
  }
}

export default function HydraClipApp() {
  const [data, setData] = useState<DataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<DataPoint[]>([])
  const currentScore = data[data.length - 1]?.value ?? 0.75
  const status = getStatus(currentScore)

  const fetchHydrationData = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: logs, error } = await supabase
        .from('hydration_logs')
        .select('*')
        .eq('nurse_id', 'n1')
        .order('created_at', { ascending: true })

      console.log('Supabase response:', { logs, error })

      if (error) {
        console.error('Error fetching hydration data:', JSON.stringify(error, null, 2))
        return
      }

      if (logs && logs.length > 0) {
        const formattedData: DataPoint[] = logs.map((log: any) => ({
          time: new Date(log.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          value: log.hydration_level,
        }))
        setData(formattedData)
        
        const forecast = generateForecast(formattedData)
        setChartData([...formattedData, ...forecast])
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHydrationData()
  }, [fetchHydrationData])

  const insertRandomHydration = useCallback(async () => {
    try {
      const supabase = createClient()
      const randomValue = Math.random() * 0.9 + 0.1
      const now = new Date().toISOString()

      const { error } = await supabase
        .from('hydration_logs')
        .insert({
          nurse_id: 'n1',
          hydration_level: randomValue,
        })

      if (error) {
        console.error('Error inserting hydration data:', JSON.stringify(error, null, 2))
        return
      }

      await fetchHydrationData()
    } catch (err) {
      console.error('Unexpected error:', err)
    }
  }, [fetchHydrationData])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[390px] bg-card rounded-[2.5rem] shadow-xl border border-border overflow-hidden">
        {/* Phone notch simulation */}
        <div className="h-8 bg-card flex items-center justify-center">
          <div className="w-28 h-6 bg-foreground/90 rounded-full" />
        </div>

        <div className="px-6 pb-8 pt-2 space-y-6">
          <Header />

          <div className="flex flex-col items-center space-y-2">
            <HydrationScore score={currentScore} />
            <StatusBadge status={status} message={getStatusMessage(status)} />
          </div>

          <HydrationChart data={chartData} />

          {status !== "hydrated" && (
            <AlertCard
              type={status === "alert" ? "urgent" : "warning"}
              message={
                status === "alert"
                  ? "Critical: Drink water immediately to avoid dehydration symptoms."
                  : "Your hydration is dropping. Consider drinking water soon."
              }
            />
          )}

          <Button onClick={insertRandomHydration} className="w-full h-12 rounded-xl gap-2 text-base font-medium" disabled={loading}>
            <Droplets className="w-5 h-5" />
            {loading ? 'Loading...' : 'Add Hydration Reading'}
          </Button>

          {/* Bottom bar */}
          <div className="flex justify-center pt-2">
            <div className="w-32 h-1 bg-foreground/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
