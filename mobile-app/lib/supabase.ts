import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pggdxvwpfdhxldcotzai.supabase.co'
const supabaseAnonKey = 'sb_publishable_XY2ny6W3IyZwlwi5p22Zgw_zVq34MGh'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
