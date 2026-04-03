import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { colors, spacing, radius, shadow } from '../theme'
import { HydrationLog } from '../types'
import { getStatus, getStatusColor } from '../utils/hydration'

type GroupedLogs = {
  morning: HydrationLog[]
  afternoon: HydrationLog[]
  evening: HydrationLog[]
  night: HydrationLog[]
}

function getTimeOfDay(dateStr: string): keyof GroupedLogs {
  const hour = new Date(dateStr).getHours()
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 24) return 'evening'
  return 'night'
}

const SECTION_LABELS: Record<keyof GroupedLogs, string> = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌆 Evening',
  night: '🌙 Night',
}

export default function HistoryScreen() {
  const { user } = useAuth()
  const [grouped, setGrouped] = useState<GroupedLogs>({ morning: [], afternoon: [], evening: [], night: [] })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchLogs = useCallback(async () => {
    const now = new Date()
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0))

    let query = supabase
      .from('hydration_logs')
      .select('*')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })

    if (user) {
      query = query.eq('user_id', user.id)
    } else {
      query = query.eq('nurse_id', 'n1')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching history:', error)
    } else if (data) {
      const result: GroupedLogs = { morning: [], afternoon: [], evening: [], night: [] }
      ;(data as HydrationLog[]).forEach((log) => {
        result[getTimeOfDay(log.created_at)].push(log)
      })
      setGrouped(result)
    }
    setLoading(false)
    setRefreshing(false)
  }, [user])

  useFocusEffect(useCallback(() => { fetchLogs() }, [fetchLogs]))

  const onRefresh = () => {
    setRefreshing(true)
    fetchLogs()
  }

  const totalLogs = Object.values(grouped).flat()
  const avgLevel = totalLogs.length
    ? totalLogs.reduce((sum, l) => sum + l.hydration_level, 0) / totalLogs.length
    : 0

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Daily History</Text>
        <Text style={styles.subtitle}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{totalLogs.length}</Text>
                <Text style={styles.summaryLabel}>Readings</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: getStatusColor(getStatus(avgLevel)) }]}>
                  {Math.round(avgLevel * 100)}%
                </Text>
                <Text style={styles.summaryLabel}>Daily Avg</Text>
              </View>
            </View>
          </View>

          {(Object.keys(SECTION_LABELS) as (keyof GroupedLogs)[]).map((section) => {
            const logs = grouped[section]
            if (logs.length === 0) return null
            return (
              <View key={section} style={styles.section}>
                <Text style={styles.sectionTitle}>{SECTION_LABELS[section]}</Text>
                {logs.map((log) => {
                  const status = getStatus(log.hydration_level)
                  const statusColor = getStatusColor(status)
                  return (
                    <View key={log.id} style={styles.logCard}>
                      <View style={[styles.levelBar, { backgroundColor: statusColor + '20' }]}>
                        <View
                          style={[
                            styles.levelFill,
                            { width: `${log.hydration_level * 100}%` as any, backgroundColor: statusColor },
                          ]}
                        />
                      </View>
                      <View style={styles.logRow}>
                        <Text style={styles.logTime}>
                          {new Date(log.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </Text>
                        <Text style={[styles.logLevel, { color: statusColor }]}>
                          {Math.round(log.hydration_level * 100)}%
                        </Text>
                      </View>
                    </View>
                  )
                })}
              </View>
            )
          })}

          {totalLogs.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>💧</Text>
              <Text style={styles.emptyText}>No readings for today yet.</Text>
              <Text style={styles.emptySubtext}>Add a hydration reading from the Home screen.</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.small,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  logCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.small,
  },
  levelBar: {
    height: 6,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  logLevel: {
    fontSize: 15,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
