import { DataPoint, HydrationStatus } from '../types'

export function getStatus(score: number): HydrationStatus {
  if (score >= 0.7) return 'hydrated'
  if (score >= 0.4) return 'dehydrating'
  return 'alert'
}

export function getStatusMessage(status: HydrationStatus): string {
  switch (status) {
    case 'hydrated':
      return 'Well Hydrated'
    case 'dehydrating':
      return 'Dehydrating'
    case 'alert':
      return 'Hydration Alert'
  }
}

export function getStatusColor(status: HydrationStatus): string {
  switch (status) {
    case 'hydrated':
      return '#22c55e'
    case 'dehydrating':
      return '#f59e0b'
    case 'alert':
      return '#ef4444'
  }
}

export function calculateTrend(data: DataPoint[]): number {
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

export function generateForecast(data: DataPoint[], numPoints: number = 3): DataPoint[] {
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
