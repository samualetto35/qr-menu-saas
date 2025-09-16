import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Client-side Supabase client
export const createSupabaseClient = (): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Server-side Supabase client (for API routes)
export const createSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase server environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Server-side client with cookies (for authentication)
export const createSupabaseServerClientWithAuth = () => {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Database schemas and types
export interface DatabaseUser {
  id: string
  email: string
  phone?: string
  country_code?: string
  business_name?: string
  first_name?: string
  last_name?: string
  is_email_verified: boolean
  is_phone_verified: boolean
  created_at: string
  updated_at: string
  last_login_at?: string
}

export interface DatabaseMenu {
  id: string
  user_id: string
  name: string
  description?: string
  is_active: boolean
  template: any // JSON field
  categories: any // JSON field  
  created_at: string
  updated_at: string
  qr_code_url?: string
}

export interface DatabaseAnalytics {
  id: string
  menu_id: string
  user_id: string
  scan_count: number
  unique_scans: number
  device_info: any // JSON field
  timestamp: string
  ip_address?: string
  user_agent?: string
}
