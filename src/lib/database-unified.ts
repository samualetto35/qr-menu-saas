// Unified database layer that works in both development and production
import { User, Menu, MenuAnalytics } from '@/types'

// Check if we're in production mode with Supabase
function isProduction() {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL
}

// Import the appropriate database implementation
let dbImplementation: any

if (isProduction()) {
  // Production: Use Supabase
  import('./database-production').then(module => {
    dbImplementation = module
  })
} else {
  // Development: Use file-based storage
  import('./database').then(module => {
    dbImplementation = module
  })
}

// Helper to ensure db implementation is loaded
async function getDb() {
  if (!dbImplementation) {
    if (isProduction()) {
      dbImplementation = await import('./database-production')
    } else {
      dbImplementation = await import('./database')
    }
  }
  return dbImplementation
}

// Export unified interface
export async function createUser(userData: {
  email: string
  hashedPassword: string
  phone?: string
  countryCode?: string
  businessName?: string
  firstName?: string
  lastName?: string
}): Promise<User> {
  const db = await getDb()
  return db.createUser(userData)
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDb()
  return db.getUserByEmail(email)
}

export async function getUserById(userId: string): Promise<User | null> {
  const db = await getDb()
  return db.getUserById(userId)
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User> {
  const db = await getDb()
  return db.updateUser(userId, updates)
}

export async function createMenu(userId: string, menuData: Partial<Menu>): Promise<Menu> {
  const db = await getDb()
  return db.createMenu(userId, menuData)
}

export async function getMenusByUserId(userId: string): Promise<Menu[]> {
  const db = await getDb()
  return db.getMenusByUserId(userId)
}

export async function getMenuById(menuId: string): Promise<Menu | null> {
  const db = await getDb()
  return db.getMenuById(menuId)
}

export async function updateMenu(menuId: string, updates: Partial<Menu>): Promise<Menu> {
  const db = await getDb()
  return db.updateMenu(menuId, updates)
}

export async function deleteMenu(menuId: string): Promise<boolean> {
  const db = await getDb()
  return db.deleteMenu(menuId)
}

export async function trackMenuScan(menuId: string, scanData: {
  deviceType: 'mobile' | 'tablet' | 'desktop'
  userAgent?: string
  ipAddress?: string
}): Promise<void> {
  const db = await getDb()
  return db.trackMenuScan(menuId, scanData)
}

export async function getMenuAnalytics(menuId: string, userId: string): Promise<MenuAnalytics> {
  const db = await getDb()
  return db.getMenuAnalytics(menuId, userId)
}

export async function hashPassword(password: string): Promise<string> {
  const db = await getDb()
  return db.hashPassword(password)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const db = await getDb()
  return db.verifyPassword(password, hashedPassword)
}

export async function generateToken(userId: string): Promise<string> {
  const db = await getDb()
  return db.generateToken(userId)
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  const db = await getDb()
  return db.verifyToken(token)
}
