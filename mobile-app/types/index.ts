export interface HydrationLog {
  id: string
  nurse_id: string
  hydration_level: number
  created_at: string
  user_id?: string
}

export type AuthStackParamList = {
  Login: undefined
  SignUp: undefined
}

export type MainTabParamList = {
  Home: undefined
  History: undefined
  Goal: undefined
  Settings: undefined
}

export interface DataPoint {
  time: string
  value: number
  forecast?: number
}

export type HydrationStatus = 'hydrated' | 'dehydrating' | 'alert'
