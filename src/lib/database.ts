import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User, Menu, MenuCategory, MenuItem, MenuAnalytics, Subscription } from '@/types'

// Server-side only imports and initialization
let fs: any = null
let path: any = null
let DB_DIR: string = ''
let USERS_FILE: string = ''
let MENUS_FILE: string = ''
let ANALYTICS_FILE: string = ''
let SUBSCRIPTIONS_FILE: string = ''

if (typeof window === 'undefined') {
  fs = require('fs')
  path = require('path')
  
  // Database file paths
  DB_DIR = path.join(process.cwd(), 'data')
  USERS_FILE = path.join(DB_DIR, 'users.json')
  MENUS_FILE = path.join(DB_DIR, 'menus.json')
  ANALYTICS_FILE = path.join(DB_DIR, 'analytics.json')
  SUBSCRIPTIONS_FILE = path.join(DB_DIR, 'subscriptions.json')

  // Ensure database directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true })
  }

  // Initialize database files if they don't exist
  const initializeFile = (filePath: string, initialData: any[]) => {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2))
    }
  }

  initializeFile(USERS_FILE, [])
  initializeFile(MENUS_FILE, [])
  initializeFile(ANALYTICS_FILE, [])
  initializeFile(SUBSCRIPTIONS_FILE, [])
}

// Helper functions to read/write data
const readData = <T>(filePath: string): T[] => {
  if (typeof window !== 'undefined' || !fs) {
    return []
  }
  
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
    return []
  }
}

const writeData = <T>(filePath: string, data: T[]): void => {
  if (typeof window !== 'undefined' || !fs) {
    return
  }
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error)
  }
}

// User operations
export const users = {
  findAll: (): User[] => readData<User>(USERS_FILE),
  
  findById: (id: string): User | undefined => {
    const users = readData<User>(USERS_FILE)
    return users.find(user => user.id === id)
  },
  
  findByEmail: (email: string): User | undefined => {
    const users = readData<User>(USERS_FILE)
    return users.find(user => user.email.toLowerCase() === email.toLowerCase())
  },
  
  create: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'password'> & { password: string }): Promise<User> => {
    const users = readData<User>(USERS_FILE)
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    users.push(newUser)
    writeData(USERS_FILE, users)
    return newUser
  },
  
  update: (id: string, updates: Partial<User>): User | null => {
    const users = readData<User>(USERS_FILE)
    const index = users.findIndex(user => user.id === id)
    
    if (index === -1) return null
    
    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    writeData(USERS_FILE, users)
    return users[index]
  },
  
  delete: (id: string): boolean => {
    const users = readData<User>(USERS_FILE)
    const index = users.findIndex(user => user.id === id)
    
    if (index === -1) return false
    
    users.splice(index, 1)
    writeData(USERS_FILE, users)
    return true
  },
  
  verifyPassword: async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword)
  }
}

// Menu operations
export const menus = {
  findAll: (): Menu[] => readData<Menu>(MENUS_FILE),
  
  findById: (id: string): Menu | undefined => {
    const menus = readData<Menu>(MENUS_FILE)
    return menus.find(menu => menu.id === id)
  },
  
  findByUserId: (userId: string): Menu[] => {
    const menus = readData<Menu>(MENUS_FILE)
    return menus.filter(menu => menu.userId === userId)
  },
  
  create: (menuData: Omit<Menu, 'id' | 'createdAt' | 'updatedAt'>): Menu => {
    const menus = readData<Menu>(MENUS_FILE)
    
    const newMenu: Menu = {
      ...menuData,
      id: `menu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    menus.push(newMenu)
    writeData(MENUS_FILE, menus)
    return newMenu
  },
  
  update: (id: string, updates: Partial<Menu>): Menu | null => {
    const menus = readData<Menu>(MENUS_FILE)
    const index = menus.findIndex(menu => menu.id === id)
    
    if (index === -1) return null
    
    menus[index] = {
      ...menus[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    writeData(MENUS_FILE, menus)
    return menus[index]
  },
  
  delete: (id: string): boolean => {
    const menus = readData<Menu>(MENUS_FILE)
    const index = menus.findIndex(menu => menu.id === id)
    
    if (index === -1) return false
    
    menus.splice(index, 1)
    writeData(MENUS_FILE, menus)
    return true
  }
}

// Analytics operations
export const analytics = {
  findAll: (): MenuAnalytics[] => readData<MenuAnalytics>(ANALYTICS_FILE),
  
  findByMenuId: (menuId: string): MenuAnalytics | undefined => {
    const analytics = readData<MenuAnalytics>(ANALYTICS_FILE)
    return analytics.find(a => a.menuId === menuId)
  },
  
  findByUserId: (userId: string): MenuAnalytics[] => {
    const analytics = readData<MenuAnalytics>(ANALYTICS_FILE)
    const userMenus = menus.findByUserId(userId)
    const userMenuIds = userMenus.map(menu => menu.id)
    return analytics.filter(a => userMenuIds.includes(a.menuId))
  },
  
  create: (analyticsData: Omit<MenuAnalytics, 'id' | 'createdAt' | 'updatedAt'>): MenuAnalytics => {
    const analytics = readData<MenuAnalytics>(ANALYTICS_FILE)
    
    const newAnalytics: MenuAnalytics = {
      ...analyticsData,
      id: `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    analytics.push(newAnalytics)
    writeData(ANALYTICS_FILE, analytics)
    return newAnalytics
  },
  
  update: (menuId: string, updates: Partial<MenuAnalytics>): MenuAnalytics | null => {
    const analytics = readData<MenuAnalytics>(ANALYTICS_FILE)
    const index = analytics.findIndex(a => a.menuId === menuId)
    
    if (index === -1) return null
    
    analytics[index] = {
      ...analytics[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    writeData(ANALYTICS_FILE, analytics)
    return analytics[index]
  },
  
  incrementScan: (menuId: string, device: 'mobile' | 'tablet' | 'desktop' = 'mobile'): void => {
    const analytics = readData<MenuAnalytics>(ANALYTICS_FILE)
    let menuAnalytics = analytics.find(a => a.menuId === menuId)
    
    if (!menuAnalytics) {
      // Create new analytics record
      menuAnalytics = {
        id: `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        menuId,
        totalScans: 0,
        uniqueScans: 0,
        scansToday: 0,
        scansThisWeek: 0,
        scansThisMonth: 0,
        deviceBreakdown: { mobile: 0, tablet: 0, desktop: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      analytics.push(menuAnalytics)
    }
    
    // Update scan counts
    menuAnalytics.totalScans++
    menuAnalytics.scansToday++
    menuAnalytics.scansThisWeek++
    menuAnalytics.scansThisMonth++
    menuAnalytics.deviceBreakdown[device]++
    menuAnalytics.updatedAt = new Date().toISOString()
    
    writeData(ANALYTICS_FILE, analytics)
  }
}

// JWT operations
export const jwt_helpers = {
  generateToken: (userId: string): string => {
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    return jwt.sign({ userId }, secret, { expiresIn: '7d' })
  },
  
  verifyToken: (token: string): { userId: string } | null => {
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key'
      const decoded = jwt.verify(token, secret) as { userId: string }
      return decoded
    } catch (error) {
      return null
    }
  }
}

// Subscription operations
export const subscriptions = {
  findAll: (): Subscription[] => readData<Subscription>(SUBSCRIPTIONS_FILE),
  
  findByUserId: (userId: string): Subscription | undefined => {
    const subscriptions = readData<Subscription>(SUBSCRIPTIONS_FILE)
    return subscriptions.find(sub => sub.userId === userId)
  },
  
  create: (subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Subscription => {
    const subscriptions = readData<Subscription>(SUBSCRIPTIONS_FILE)
    
    const newSubscription: Subscription = {
      ...subscriptionData,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    subscriptions.push(newSubscription)
    writeData(SUBSCRIPTIONS_FILE, subscriptions)
    return newSubscription
  },
  
  update: (userId: string, updates: Partial<Subscription>): Subscription | null => {
    const subscriptions = readData<Subscription>(SUBSCRIPTIONS_FILE)
    const index = subscriptions.findIndex(sub => sub.userId === userId)
    
    if (index === -1) return null
    
    subscriptions[index] = {
      ...subscriptions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    writeData(SUBSCRIPTIONS_FILE, subscriptions)
    return subscriptions[index]
  }
}
