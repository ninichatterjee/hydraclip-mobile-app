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
import { getStatus, getStatusColor } from '../utils/hydration'

export default function GoalScreen() {
  const { user } = useAuth()
  const [goal, setGoal] = useState(0.8)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('hydration_goal')
          .eq('id', user.id)
          .single()
        if (profile?.hydration_goal) setGoal(profile.hydration_goal)
      }

      let query = supabase
        .from('hydration_logs')
        .select('hydration_level')
        .order('created_at', { ascending: false })
        .limit(1)
      if (user) {
        query = query.eq('user_id', user.id)
      } else {
        query = query.eq('nurse_id', 'n1')
      }
      const { data: latest } = await query
      if (latest && latest.length > 0) setCurrentLevel(latest[0].hydration_level)
    } catch (err) {
      console.error('Error fetching goal data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useFocusEffect(useCallback(() => { fetchData() }, [fetchData]))

  const onRefresh = () => { setRefreshing(true); fetchData() }

  const progress = Math.min(currentLevel / goal, 1)
  const remaining = Math.max(0, goal - currentLevel)
  const goalPct = Math.round(goal * 100)
  const currentPct = Math.round(currentLevel * 100)
  const remainingPct = Math.round(remaining * 100)
  const status = getStatus(currentLevel)
  const statusColor = getStatusColor(status)

  const CIRCLE_SIZE = 180
  const STROKE = 12
  const R = (CIRCLE_SIZE - STROKE) / 2
  const CIRCUMFERENCE = 2 * Math.PI * R
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Hydration Goal</Text>
        <Text style={styles.subtitle}>Daily target: {goalPct}%</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <>
          <View style={styles.circleCard}>
            <View style={[styles.circleOuter, { borderColor: colors.border }]}>
              <View style={[styles.circleInner, { borderColor: statusColor }]}>
                <Text style={[styles.circleValue, { color: statusColor }]}>{currentPct}%</Text>
                <Text style={styles.circleLabel}>Current</Text>
              </View>
            </View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Progress to Goal</Text>
              <Text style={[styles.progressPct, { color: statusColor }]}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.round(progress * 100)}%` as any, backgroundColor: statusColor },
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelLeft}>0%</Text>
              <Text style={styles.progressLabelRight}>Goal: {goalPct}%</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: statusColor }]}>{currentPct}%</Text>
              <Text style={styles.statLabel}>Current Level</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{goalPct}%</Text>
              <Text style={styles.statLabel}>Daily Goal</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: remainingPct === 0 ? colors.success : colors.warning }]}>
                {remainingPct}%
              </Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>

          <View style={[
            styles.alertCard,
            {
              backgroundColor: remainingPct === 0 ? colors.successLight : colors.warningLight,
              borderColor: remainingPct === 0 ? colors.success : colors.warning,
            },
          ]}>
            <Text style={[
              styles.alertText,
              { color: remainingPct === 0 ? colors.success : colors.warning },
            ]}>
              {remainingPct === 0
                ? '🎉 You have reached your daily hydration goal!'
                : `💧 ${remainingPct}% left to reach your daily goal of ${goalPct}%.`}
            </Text>
          </View>
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
  circleCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadow.small,
  },
  circleOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleInner: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  circleValue: {
    fontSize: 40,
    fontWeight: '700',
  },
  circleLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.small,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  progressPct: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelLeft: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  progressLabelRight: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.small,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  alertCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  alertText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
})
