import { User, Menu, MenuAnalytics } from '@/types'

// In-memory storage for created menus (persists until server restart)
let createdMenus: Menu[] = []

// Mock user data
export const mockUser: User = {
  id: 'user_123',
  email: 'demo@restaurant.com',
  fullName: 'John Smith',
  businessName: 'Bella Vista Restaurant',
  phone: '+1234567890',
  isEmailVerified: true,
  isPhoneVerified: true,
  subscriptionStatus: 'active',
  subscriptionPlan: 'professional',
  subscriptionExpiry: '2024-12-31',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

// Mock menu data
export const mockMenus: Menu[] = [
  {
    id: 'menu_1',
    userId: 'user_123',
    name: 'Main Menu',
    description: 'Our signature dishes and classic favorites',
    isActive: true,
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAYAAAA+s9J6',
    url: 'http://localhost:3000/menu/menu_1',
    template: {
      id: 'modern',
      name: 'Modern',
      layout: 'modern',
      colors: {
        primary: '#0ea5e9',
        secondary: '#64748b',
        accent: '#ef4444',
        background: '#ffffff',
        text: '#1f2937'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      }
    },
    categories: [
      {
        id: 'cat_1',
        menuId: 'menu_1',
        name: '🍝 Main Dishes',
        order: 0,
        items: [
          {
            id: 'item_1',
            categoryId: 'cat_1',
            name: 'Spaghetti Carbonara',
            description: 'Classic Italian pasta with eggs, cheese, and bacon',
            price: 18.50,
            ingredients: ['Spaghetti', 'Eggs', 'Parmesan', 'Bacon', 'Black Pepper'],
            isAvailable: true,
            order: 0
          },
          {
            id: 'item_2',
            categoryId: 'cat_1',
            name: 'Grilled Salmon',
            description: 'Fresh Atlantic salmon with herbs and lemon',
            price: 24.00,
            ingredients: ['Salmon', 'Lemon', 'Herbs', 'Olive Oil'],
            isAvailable: true,
            order: 1
          }
        ]
      },
      {
        id: 'cat_2',
        menuId: 'menu_1',
        name: '🍷 Beverages',
        order: 1,
        items: [
          {
            id: 'item_3',
            categoryId: 'cat_2',
            name: 'House Wine',
            description: 'Red or white wine selection',
            price: 8.00,
            isAvailable: true,
            order: 0
          },
          {
            id: 'item_4',
            categoryId: 'cat_2',
            name: 'Craft Beer',
            description: 'Local brewery selection',
            price: 6.00,
            isAvailable: true,
            order: 1
          }
        ]
      }
    ],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'menu_2',
    userId: 'user_123',
    name: 'Breakfast Menu',
    description: 'Fresh breakfast options available until 11 AM',
    isActive: true,
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAYAAAA+s9J7',
    url: 'http://localhost:3000/menu/menu_2',
    template: {
      id: 'classic',
      name: 'Classic',
      layout: 'classic',
      colors: {
        primary: '#7c3aed',
        secondary: '#6b7280',
        accent: '#f59e0b',
        background: '#fefefe',
        text: '#374151'
      },
      fonts: {
        heading: 'Georgia',
        body: 'Georgia'
      }
    },
    categories: [
      {
        id: 'cat_3',
        menuId: 'menu_2',
        name: '🥞 Breakfast',
        order: 0,
        items: [
          {
            id: 'item_5',
            categoryId: 'cat_3',
            name: 'Pancakes',
            description: 'Fluffy pancakes with maple syrup',
            price: 12.00,
            isAvailable: true,
            order: 0
          },
          {
            id: 'item_6',
            categoryId: 'cat_3',
            name: 'Eggs Benedict',
            description: 'Poached eggs on English muffin with hollandaise',
            price: 14.50,
            isAvailable: true,
            order: 1
          }
        ]
      }
    ],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z'
  }
]

// Mock analytics data
export const mockAnalytics: MenuAnalytics[] = [
  {
    id: 'analytics_1',
    menuId: 'menu_1',
    totalScans: 1247,
    uniqueScans: 986,
    scansToday: 45,
    scansThisWeek: 312,
    scansThisMonth: 1189,
    deviceBreakdown: {
      mobile: 892,
      tablet: 201,
      desktop: 154
    },
    scanHistory: [
      {
        id: 'scan_1',
        menuId: 'menu_1',
        timestamp: '2024-01-20T14:30:00Z',
        deviceType: 'mobile',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
        ipAddress: '192.168.1.1'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z'
  },
  {
    id: 'analytics_2',
    menuId: 'menu_2',
    totalScans: 523,
    uniqueScans: 445,
    scansToday: 18,
    scansThisWeek: 134,
    scansThisMonth: 501,
    deviceBreakdown: {
      mobile: 398,
      tablet: 85,
      desktop: 40
    },
    scanHistory: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z'
  }
]

// Helper functions
export const findUserByEmail = (email: string): User | undefined => {
  return email === mockUser.email ? mockUser : undefined
}

export const findMenusByUserId = (userId: string): Menu[] => {
  if (userId === mockUser.id) {
    return [...mockMenus, ...createdMenus]
  }
  return []
}

export const findMenuById = (id: string): Menu | undefined => {
  const allMenus = [...mockMenus, ...createdMenus]
  return allMenus.find(menu => menu.id === id)
}

export const addCreatedMenu = (menu: Menu): void => {
  createdMenus.push(menu)
}

export const findAnalyticsByMenuId = (menuId: string): MenuAnalytics | undefined => {
  return mockAnalytics.find(analytics => analytics.menuId === menuId)
}
