import { User as SupabaseUser } from '@supabase/supabase-js'

export type User = SupabaseUser

export interface UserProfile {
  id: string
  email: string
  marketing_consent: boolean
  created_at: string
}
