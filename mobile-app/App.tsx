import { useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { ActivityIndicator, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ReadingIntervalProvider } from './contexts/ReadingIntervalContext'
import LoginScreen from './screens/LoginScreen'
import SignUpScreen from './screens/SignUpScreen'
import HomeScreen from './screens/HomeScreen'
import HistoryScreen from './screens/HistoryScreen'
import GoalScreen from './screens/GoalScreen'
import SettingsScreen from './screens/SettingsScreen'
import { MainTabParamList } from './types'
import { colors } from './theme'

const MainTab = createBottomTabNavigator<MainTabParamList>()

function AuthScreens() {
  const [screen, setScreen] = useState<'Login' | 'SignUp'>('Login')
  if (screen === 'SignUp') {
    return <SignUpScreen onNavigate={setScreen} />
  }
  return <LoginScreen onNavigate={setScreen} />
}

function MainNavigator() {
  return (
    <NavigationContainer>
      <MainTab.Navigator
        screenOptions={({ route }) => ({
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: 30,
            paddingTop: 8,
            height: 80,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: { fontSize: 11 },
          tabBarIcon: ({ focused, color, size }) => {
            const icons: Record<string, { active: string; inactive: string }> = {
              Home: { active: 'water', inactive: 'water-outline' },
              History: { active: 'calendar', inactive: 'calendar-outline' },
              Goal: { active: 'flag', inactive: 'flag-outline' },
              Settings: { active: 'settings', inactive: 'settings-outline' },
            }
            const icon = icons[route.name]
            return (
              <Ionicons
                name={(focused ? icon?.active : icon?.inactive) as any}
                size={size}
                color={color}
              />
            )
          },
        })}
      >
        <MainTab.Screen name="Home" component={HomeScreen} options={{ headerShown: false, title: 'HydraClip' }} />
        <MainTab.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
        <MainTab.Screen name="Goal" component={GoalScreen} options={{ title: 'My Goal' }} />
        <MainTab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </MainTab.Navigator>
    </NavigationContainer>
  )
}

function RootNavigator() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return user ? <MainNavigator /> : <AuthScreens />
}

export default function App() {
  return (
    <AuthProvider>
      <ReadingIntervalProvider>
        <RootNavigator />
      </ReadingIntervalProvider>
    </AuthProvider>
  )
}
