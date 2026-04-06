import { useState, useCallback, useEffect, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useReadingInterval } from '../contexts/ReadingIntervalContext'
import { DataPoint, HydrationLog } from '../types'
import { getStatus, getStatusMessage, getStatusColor, generateForecast } from '../utils/hydration'
import { colors, spacing, radius, shadow } from '../theme'

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { intervalMinutes } = useReadingInterval()
  const [data, setData] = useState<DataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentScore = data.length > 0 ? data[data.length - 1].value : 0.75
  const status = getStatus(currentScore)

  const fetchHydrationData = useCallback(async () => {
    try {
      let query = supabase
        .from('hydration_logs')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(30)

      if (user) {
        query = query.eq('user_id', user.id)
      } else {
        query = query.eq('nurse_id', 'n1')
      }

      const { data: logs, error } = await query
      console.log('Supabase response:', { logs, error })

      if (error) {
        console.error('Error fetching hydration data:', JSON.stringify(error, null, 2))
        return
      }

      if (logs && logs.length > 0) {
        const formattedData: DataPoint[] = (logs as HydrationLog[]).map((log) => ({
          time: new Date(log.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          value: log.hydration_level,
        }))
        setData(formattedData.slice(-7))
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchHydrationData() }, [fetchHydrationData])

  // Auto-insert a simulated reading every intervalMinutes
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)

    const ms = intervalMinutes * 60 * 1000
    timerRef.current = setInterval(async () => {
      try {
        const randomValue = Math.random() * 0.9 + 0.1
        const insertData: any = { hydration_level: randomValue, nurse_id: 'n1' }
        if (user) insertData.user_id = user.id

        const { error } = await supabase.from('hydration_logs').insert(insertData)
        if (error) {
          console.error('Auto-reading insert error:', JSON.stringify(error, null, 2))
          return
        }
        await fetchHydrationData()
      } catch (err) {
        console.error('Auto-reading error:', err)
      }
    }, ms)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [intervalMinutes, user, fetchHydrationData])

  const chartData = [...data, ...generateForecast(data)]
  const totalPoints = chartData.length
  const MAX_LABELS = 5
  const chartLabels = chartData.map((d, i) => {
    const step = Math.max(1, Math.floor(totalPoints / (MAX_LABELS - 1)))
    return i % step === 0 || i === totalPoints - 1 ? d.time : ''
  })
  const chartValues = chartData.map((d) => d.value)

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.sm }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HydraClip</Text>
        <Text style={styles.headerSubtitle}>Hydration Monitor</Text>
      </View>

      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { borderColor: getStatusColor(status) }]}>
          <Text style={styles.scoreValue}>{Math.round(currentScore * 100)}%</Text>
          <Text style={styles.scoreLabel}>Hydration</Text>
        </View>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
        <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
          {getStatusMessage(status)}
        </Text>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Hydration Trend</Text>
          <Text style={styles.chartSubtitle}>With forecast</Text>
        </View>
        {loading ? (
          <View style={styles.chartLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : chartData.length > 0 ? (
          <View style={styles.chartList}>
            {chartData.map((point, index) => {
              const isForecast = typeof point.forecast === 'number'
              const displayValue = isForecast ? point.forecast! : point.value

              return (
                <View key={`${point.time}-${index}`} style={styles.chartRow}>
                  <Text style={styles.chartLabel}>{chartLabels[index] || point.time}</Text>
                  <View style={styles.chartBarTrack}>
                    <View
                      style={[
                        styles.chartBarFill,
                        {
                          width: `${Math.max(displayValue, 0.02) * 100}%`,
                          backgroundColor: isForecast ? colors.textSecondary : colors.primary,
                          opacity: isForecast ? 0.45 : 1,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartValue}>{Math.round(displayValue * 100)}%</Text>
                </View>
              )
            })}
          </View>
        ) : (
          <View style={styles.chartLoading}>
            <Text style={styles.noDataText}>No data available</Text>
          </View>
        )}
      </View>

      {status !== 'hydrated' && (
        <View style={[styles.alertCard, {
          backgroundColor: status === 'alert' ? colors.errorLight : colors.warningLight,
          borderColor: status === 'alert' ? colors.error : colors.warning,
        }]}>
          <Text style={[styles.alertText, { color: status === 'alert' ? colors.error : colors.warning }]}>
            {status === 'alert'
              ? 'Critical: Drink water immediately to avoid dehydration symptoms.'
              : 'Your hydration is dropping. Consider drinking water soon.'}
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  headerTitle: { fontSize: 28, fontWeight: '700', color: colors.text },
  headerSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  scoreContainer: { alignItems: 'center', marginBottom: spacing.md },
  scoreCircle: {
    width: 160, height: 160, borderRadius: 80, borderWidth: 8,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card,
    ...shadow.medium,
  },
  scoreValue: { fontSize: 42, fontWeight: '700', color: colors.text },
  scoreLabel: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, marginBottom: spacing.lg,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  statusText: { fontSize: 14, fontWeight: '600' },
  chartContainer: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.md, ...shadow.small,
  },
  chartHeader: { marginBottom: spacing.sm },
  chartTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  chartSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  chartList: { gap: spacing.sm, paddingTop: spacing.xs },
  chartRow: { flexDirection: 'row', alignItems: 'center' },
  chartLabel: { width: 56, fontSize: 12, color: colors.textSecondary },
  chartBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  chartBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  chartValue: {
    width: 44,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartLoading: { height: 180, alignItems: 'center', justifyContent: 'center' },
  noDataText: { color: colors.textSecondary, fontSize: 14 },
  alertCard: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, marginBottom: spacing.md },
  alertText: { fontSize: 14, lineHeight: 20 },
})
