"use client"

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"

interface DataPoint {
  time: string
  value: number
  forecast?: number
}

interface HydrationChartProps {
  data: DataPoint[]
}

export function HydrationChart({ data }: HydrationChartProps) {
  return (
    <Card className="border-0 shadow-sm bg-secondary/30">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-medium text-foreground">Hydration Trend</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">Last 2 hours</p>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hydrationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.6 0.15 230)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="oklch(0.6 0.15 230)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "oklch(0.5 0.02 230)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 1]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "oklch(0.5 0.02 230)" }}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid oklch(0.9 0.015 230)",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{ color: "oklch(0.25 0.02 230)", fontWeight: 500 }}
                formatter={(value: number) => [value.toFixed(2), "Level"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="oklch(0.55 0.15 230)"
                strokeWidth={2.5}
                fill="url(#hydrationGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "oklch(0.55 0.15 230)", strokeWidth: 2, stroke: "white" }}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="oklch(0.55 0.15 230)"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4, fill: "oklch(0.55 0.15 230)", strokeWidth: 2, stroke: "white" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
