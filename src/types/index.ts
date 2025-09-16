// User types
export interface User {
  id: string
  email: string
  password?: string // Only stored in database, never sent to client
  fullName: string
  businessName: string
  phone: string
  countryCode?: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled'
  subscriptionPlan: 'starter' | 'professional' | 'enterprise'
  subscriptionExpiry: string
  emailVerificationToken?: string
  phoneVerificationToken?: string
  passwordResetToken?: string
  passwordResetExpiry?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

// Menu types
export interface Menu {
  id: string
  userId: string
  name: string
  description?: string
  isActive: boolean
  qrCode: string
  url: string
  template: MenuTemplate
  categories: MenuCategory[]
  createdAt: string
  updatedAt: string
}

export interface MenuCategory {
  id: string
  menuId: string
  name: string
  description?: string
  order: number
  items: MenuItem[]
}

export interface MenuItem {
  id: string
  categoryId: string
  name: string
  description?: string
  price?: number
  ingredients?: string[]
  imageUrl?: string
  isAvailable: boolean
  order: number
}

export interface MenuTemplate {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  fonts: {
    heading: string
    body: string
  }
  layout: 'modern' | 'classic' | 'minimal' | 'elegant'
}

export interface ColorTemplate {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
}

export interface FontOption {
  id: string
  name: string
  displayName: string
  category: string
  googleFontUrl: string
  fallback: string
}

// Analytics types
export interface MenuAnalytics {
  id: string
  menuId: string
  totalScans: number
  uniqueScans: number
  scansToday: number
  scansThisWeek: number
  scansThisMonth: number
  deviceBreakdown: {
    mobile: number
    tablet: number
    desktop: number
  }
  scanHistory?: ScanRecord[]
  createdAt: string
  updatedAt: string
}

export interface ScanRecord {
  id: string
  menuId: string
  timestamp: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
  userAgent: string
  ipAddress: string
}

// Authentication types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  fullName: string
  businessName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: User
  token?: string
}

// Country code types
export interface CountryCode {
  code: string
  name: string
  dialCode: string
}

// Subscription types
export interface Subscription {
  id: string
  userId: string
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'trial' | 'active' | 'cancelled' | 'expired' | 'past_due'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: string
  updatedAt: string
}

// Form validation types
export interface FormErrors {
  [key: string]: string | undefined
}
