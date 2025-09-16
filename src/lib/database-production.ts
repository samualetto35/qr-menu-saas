import { createSupabaseServerClient } from './supabase'
import { User, Menu, MenuAnalytics } from '@/types'
import { DatabaseUser, DatabaseMenu, DatabaseAnalytics } from './supabase'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Helper function to check if we're using Supabase
function useSupabase() {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL
}

// Helper functions to convert between database and app types
function convertDatabaseUserToUser(dbUser: DatabaseUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    phone: dbUser.phone || '',
    countryCode: dbUser.country_code || '+1',
    businessName: dbUser.business_name || '',
    firstName: dbUser.first_name || '',
    lastName: dbUser.last_name || '',
    isEmailVerified: dbUser.is_email_verified,
    isPhoneVerified: dbUser.is_phone_verified,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
    lastLoginAt: dbUser.last_login_at
  }
}

function convertUserToDatabaseUser(user: Partial<User>): Partial<DatabaseUser> {
  return {
    email: user.email,
    phone: user.phone,
    country_code: user.countryCode,
    business_name: user.businessName,
    first_name: user.firstName,
    last_name: user.lastName,
    is_email_verified: user.isEmailVerified,
    is_phone_verified: user.isPhoneVerified
  }
}

function convertDatabaseMenuToMenu(dbMenu: DatabaseMenu): Menu {
  return {
    id: dbMenu.id,
    userId: dbMenu.user_id,
    name: dbMenu.name,
    description: dbMenu.description || '',
    isActive: dbMenu.is_active,
    template: dbMenu.template,
    categories: dbMenu.categories || [],
    createdAt: dbMenu.created_at,
    updatedAt: dbMenu.updated_at,
    qrCode: dbMenu.qr_code_url || ''
  }
}

function convertMenuToDatabaseMenu(menu: Partial<Menu>, userId: string): Partial<DatabaseMenu> {
  return {
    user_id: userId,
    name: menu.name,
    description: menu.description,
    is_active: menu.isActive,
    template: menu.template,
    categories: menu.categories,
    qr_code_url: menu.qrCode
  }
}

// Production Database Functions (Supabase)
export async function createUser(userData: {
  email: string
  hashedPassword: string
  phone?: string
  countryCode?: string
  businessName?: string
  firstName?: string
  lastName?: string
}): Promise<User> {
  if (!useSupabase()) {
    throw new Error('Supabase not configured')
  }

  const supabase = createSupabaseServerClient()
  
  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.hashedPassword,
    email_confirm: false
  })

  if (authError) {
    throw new Error(`Failed to create auth user: ${authError.message}`)
  }

  // Create user profile in our users table
  const userProfile = {
    id: authData.user.id,
    email: userData.email,
    phone: userData.phone,
    country_code: userData.countryCode,
    business_name: userData.businessName,
    first_name: userData.firstName,
    last_name: userData.lastName,
    is_email_verified: false,
    is_phone_verified: false
  }

  const { data, error } = await supabase
    .from('users')
    .insert([userProfile])
    .select()
    .single()

  if (error) {
    // Cleanup auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id)
    throw new Error(`Failed to create user profile: ${error.message}`)
  }

  return convertDatabaseUserToUser(data as DatabaseUser)
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!useSupabase()) {
    throw new Error('Supabase not configured')
  }

  const supabase = createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !data) {
    return null
  }

  return convertDatabaseUserToUser(data as DatabaseUser)
}

export async function getUserById(userId: string): Promise<User | null> {
  if (!useSupabase()) {
    throw new Error('Supabase not configured')
  }

  const supabase = createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return convertDatabaseUserToUser(data as DatabaseUser)
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User> {
  if (!useSupabase()) {
    throw new Error('Supabase not configured')
  }

  const supabase = createSupabaseServerClient()
  
  const dbUpdates = convertUserToDatabaseUser(updates)
  
  const { data, error } = await supabase
    .from('users')
    .update(dbUpdates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`)
  }

  return convertDatabaseUserToUser(data as DatabaseUser)
}

export async function createMenu(userId: string, menuData: Partial<Menu>): Promise<Menu> {
  if (!useSupabase()) {
    throw new Error('Supabase not configured')
  }

  const supabase = createSupabaseServerClient()
  
  const dbMenu = convertMenuToDatabaseMenu(menuData, userId)
  
  const { data, error } = await supabase
    .from('menus')
    .insert([dbMenu])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create menu: ${error.message}`)
  }

  return convertDatabaseMenuToMenu(data as DatabaseMenu)
}

export async function getMenusByUserId(userId: string): Promise<Menu[]> {
  if (!useSupabase()) {
    throw new Error('Supabase not configured')
  }

  const supabase = createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get menus: ${error.message}`)
  }

  return (data as DatabaseMenu[]).map(convertDatabaseMenuToMenu)
}

export async function getMenuById(menuId: string): Promise<Menu | null> {
  if (!useSupabase()) {
    throw new Error('Supabase not configured')
  }

  const supabase = createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('id', menuId)
    .single()

  if (error || !data) {
    return null
  }

  return convertDatabaseMenuToMenu(data as DatabaseMenu)
}

export async function updateMenu(menuId: string, updates: Partial<Menu>): Promise<Menu> {
  if (!useSupabase()) {
    throw new Error('Supabase not configured')
  }

  const supabase = createSupabaseServerClient()
  
  // Get current menu to get user_id
  const currentMenu = await getMenuById(menuId)
  if (!currentMenu) {
    throw new Error('Menu not found')
  }
  
  const dbUpdates = convertMenuToDatabaseMenu(updates, currentMenu.userId)
  
  const { data, error } = await supabase
    .from('menus')
    .update(dbUpdates)
    .eq('id', menuId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update menu: ${error.message}`)
  }

  return convertDatabaseMenuToMenu(data as DatabaseMenu)
}

export async function deleteMenu(menuId: string): Promise<boolean> {
  if (!useSupabase()) {
    throw new Error('Supabase not configured')
  }

  const supabase = createSupabaseServerClient()
  
  const { error } = await supabase
    .from('menus')
    .delete()
    .eq('id', menuId)

  if (error) {
    throw new Error(`Failed to delete menu: ${error.message}`)
  }

  return true
}

export async function trackMenuScan(menuId: string, scanData: {
  deviceType: 'mobile' | 'tablet' | 'desktop'
  userAgent?: string
  ipAddress?: string
}): Promise<void> {
  if (!useSupabase()) {
    throw new Error('Supabase not configured')
  }

  const supabase = createSupabaseServerClient()
  
  // Get menu to get user_id
  const menu = await getMenuById(menuId)
  if (!menu) {
    throw new Error('Menu not found')
  }
  
  const analyticsData = {
    menu_id: menuId,
    user_id: menu.userId,
    device_info: {
      type: scanData.deviceType,
      userAgent: scanData.userAgent
    },
    ip_address: scanData.ipAddress,
    user_agent: scanData.userAgent
  }
  
  const { error } = await supabase
    .from('analytics')
    .insert([analyticsData])

  if (error) {
    console.error('Failed to track menu scan:', error.message)
    // Don't throw error for analytics - it shouldn't break the menu display
  }
}

export async function getMenuAnalytics(menuId: string, userId: string): Promise<MenuAnalytics> {
  if (!useSupabase()) {
    throw new Error('Supabase not configured')
  }

  const supabase = createSupabaseServerClient()
  
  // Get analytics from the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { data, error } = await supabase
    .from('analytics')
    .select('*')
    .eq('menu_id', menuId)
    .eq('user_id', userId)
    .gte('timestamp', thirtyDaysAgo.toISOString())

  if (error) {
    throw new Error(`Failed to get analytics: ${error.message}`)
  }

  // Process analytics data
  const analytics = data as DatabaseAnalytics[]
  const totalScans = analytics.length
  const uniqueScans = new Set(analytics.map(a => a.ip_address)).size
  
  const deviceBreakdown = analytics.reduce((acc, scan) => {
    const deviceType = scan.device_info?.type || 'unknown'
    acc[deviceType] = (acc[deviceType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Group by date for chart data
  const scansByDate = analytics.reduce((acc, scan) => {
    const date = new Date(scan.timestamp).toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    id: menuId,
    menuId,
    userId,
    totalScans,
    uniqueScans,
    scanHistory: Object.entries(scansByDate).map(([date, scans]) => ({
      date,
      scans
    })),
    deviceBreakdown,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// Auth helper functions
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12)
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword)
}

export function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET || 'development-secret-key'
  return jwt.sign({ userId }, secret, { expiresIn: '30d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const secret = process.env.JWT_SECRET || 'development-secret-key'
    const decoded = jwt.verify(token, secret) as { userId: string }
    return decoded
  } catch {
    return null
  }
}
