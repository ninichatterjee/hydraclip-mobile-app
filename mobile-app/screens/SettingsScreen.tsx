import { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useReadingInterval } from '../contexts/ReadingIntervalContext'
import { colors, spacing, radius, shadow } from '../theme'

export default function SettingsScreen() {
  const { user } = useAuth()
  const [goalInput, setGoalInput] = useState('80')
  const [notifications, setNotifications] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hospitalName, setHospitalName] = useState<string | null>(null)
  const { intervalMinutes, setIntervalMinutes } = useReadingInterval()
  const [readingInterval, setReadingInterval] = useState(String(intervalMinutes))
  const [reminderMode, setReminderMode] = useState<'vibration' | 'sound'>('vibration')

  const fetchProfile = useCallback(async () => {
    if (!user) { setLoading(false); return }
    const { data } = await supabase
      .from('profiles')
      .select('hydration_goal, hospitals(name)')
      .eq('id', user.id)
      .single()
    if (data?.hydration_goal) setGoalInput(String(Math.round(data.hydration_goal * 100)))
    const hospital = (data as any)?.hospitals
    if (hospital?.name) setHospitalName(hospital.name)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const saveGoal = async () => {
    const parsed = parseInt(goalInput, 10)
    if (isNaN(parsed) || parsed < 1 || parsed > 100) {
      Alert.alert('Invalid Goal', 'Please enter a number between 1 and 100.')
      return
    }
    if (!user) {
      Alert.alert('Not signed in', 'Sign in to save your goal.')
      return
    }
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, hydration_goal: parsed / 100 })
    if (error) {
      Alert.alert('Error', 'Could not save goal. Please try again.')
    } else {
      Alert.alert('Saved', `Your hydration goal has been set to ${parsed}%.`)
    }
    setSaving(false)
  }

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => supabase.auth.signOut(),
      },
    ])
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        {user && <Text style={styles.subtitle}>{user.email}</Text>}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hydration Goal</Text>
            <View style={styles.card}>
              <Text style={styles.label}>Daily goal (%)</Text>
              <Text style={styles.hint}>Enter a number between 1 and 100</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={goalInput}
                  onChangeText={setGoalInput}
                  keyboardType="numeric"
                  maxLength={3}
                  placeholder="80"
                  placeholderTextColor={colors.textSecondary}
                />
                <Text style={styles.pctSuffix}>%</Text>
              </View>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.buttonDisabled]}
                onPress={saveGoal}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Goal</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reading Interval</Text>
            <View style={styles.card}>
              <Text style={styles.label}>How often to take a reading</Text>
              <Text style={styles.hint}>Interval in minutes between readings</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={readingInterval}
                  onChangeText={(text) => {
                    setReadingInterval(text)
                    const parsed = parseFloat(text)
                    if (!isNaN(parsed) && parsed > 0) {
                      setIntervalMinutes(parsed)
                    }
                  }}
                  keyboardType="decimal-pad"
                  maxLength={4}
                  placeholder="20"
                  placeholderTextColor={colors.textSecondary}
                />
                <Text style={styles.pctSuffix}>min</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminder Mode</Text>
            <View style={styles.card}>
              <Text style={styles.label}>How would you like to be reminded?</Text>
              <Text style={styles.hint}>Connected to HydraClip hardware</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[
                    styles.toggleOption,
                    reminderMode === 'vibration' && styles.toggleOptionActive,
                  ]}
                  onPress={() => setReminderMode('vibration')}
                >
                  <Text style={[
                    styles.toggleOptionText,
                    reminderMode === 'vibration' && styles.toggleOptionTextActive,
                  ]}>Low Vibration</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleOption,
                    reminderMode === 'sound' && styles.toggleOptionActive,
                  ]}
                  onPress={() => setReminderMode('sound')}
                >
                  <Text style={[
                    styles.toggleOptionText,
                    reminderMode === 'sound' && styles.toggleOptionTextActive,
                  ]}>Low Sound</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <View>
                  <Text style={styles.rowTitle}>Hydration Reminders</Text>
                  <Text style={styles.rowSubtitle}>Get reminded to drink water</Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organization</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Hospital</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{hospitalName ?? 'Not assigned'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: hospitalName ? colors.success : colors.textSecondary }]} />
                  <Text style={[styles.infoValue, { color: hospitalName ? colors.success : colors.textSecondary }]} numberOfLines={1}>
                    {hospitalName ? 'Connected' : 'Not connected'}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Device</Text>
                <Text style={[styles.infoValue, { color: hospitalName ? colors.primary : colors.textSecondary }]} numberOfLines={1}>
                  {hospitalName ? 'HydraClip Active' : '—'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{user?.email ?? '—'}</Text>
              </View>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.small,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
  },
  pctSuffix: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    width: 80,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  logoutButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.error,
  },
  statusRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  toggleOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  toggleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleOptionTextActive: {
    color: colors.primary,
  },
})
