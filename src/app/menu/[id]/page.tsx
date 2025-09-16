'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Menu } from '@/types'
import { fontOptions, getFontById } from '@/lib/templates'
import FontLoader from '@/components/FontLoader'

const PublicMenuPage: React.FC = () => {
  const params = useParams()
  const [menu, setMenu] = useState<Menu | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const menuId = params.id as string
        
        // Fetch menu from API
        const response = await fetch(`/api/menu/${menuId}`)
        const data = await response.json()
        
        if (!data.success) {
          setError(data.message || 'Menu not found')
          return
        }

        const foundMenu = data.menu
        setMenu(foundMenu)
        
        // Expand all categories by default on mobile
        setExpandedCategories(new Set(foundMenu.categories.map((cat: any) => cat.id)))
        
        // Track analytics
        await trackMenuScan(menuId)

      } catch (err) {
        setError('Failed to load menu')
      } finally {
        setIsLoading(false)
      }
    }

    const trackMenuScan = async (menuId: string) => {
      try {
        // Detect device type
        const deviceType = getDeviceType()
        
        await fetch('/api/analytics/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            menuId,
            deviceType,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          })
        })
      } catch (error) {
        console.error('Failed to track scan:', error)
        // Don't fail the whole page if analytics fail
      }
    }

    const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
      if (typeof window === 'undefined') return 'desktop'
      const width = window.innerWidth
      if (width < 768) return 'mobile'
      if (width < 1024) return 'tablet'
      return 'desktop'
    }

    loadMenu()
  }, [params.id])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    )
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{error}</h1>
          <p className="text-gray-600">Please try scanning the QR code again or contact the restaurant.</p>
        </div>
      </div>
    )
  }

  const template = menu.template

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: template.colors.background,
        color: template.colors.text,
        fontFamily: `${template.fonts.body}, ${getFontById(template.fonts.body)?.fallback || 'sans-serif'}`
      }}
    >
      <FontLoader fonts={fontOptions} />
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="text-center">
            <h1 
              className="text-2xl font-bold mb-1"
              style={{ 
                color: template.colors.primary,
                fontFamily: `${template.fonts.heading}, ${getFontById(template.fonts.heading)?.fallback || 'serif'}`
              }}
            >
              {menu.name}
            </h1>
            {menu.description && (
              <p className="text-sm text-gray-600">{menu.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {menu.categories.map((category) => (
            <div 
              key={category.id} 
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
              >
                <div className="flex items-center justify-between">
                  <h2 
                    className="text-xl font-semibold"
                    style={{ 
                      color: template.colors.primary,
                      fontFamily: `${template.fonts.heading}, ${getFontById(template.fonts.heading)?.fallback || 'serif'}`
                    }}
                  >
                    {category.name}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {category.items.filter(item => item.isAvailable).length} items
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedCategories.has(category.id) ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Category Items */}
              {expandedCategories.has(category.id) && (
                <div className="border-t border-gray-200">
                  {category.items.filter(item => item.isAvailable).map((item, index) => (
                    <div 
                      key={item.id} 
                      className={`px-6 py-4 ${index !== category.items.filter(item => item.isAvailable).length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {item.name}
                          </h3>
                          
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                          
                          {item.ingredients && item.ingredients.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {item.ingredients.map((ingredient, idx) => (
                                <span 
                                  key={idx}
                                  className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                                >
                                  {ingredient}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {item.price && (
                          <div className="flex-shrink-0">
                            <span 
                              className="text-lg font-semibold"
                              style={{ color: template.colors.accent }}
                            >
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {category.items.filter(item => item.isAvailable).length === 0 && (
                    <div className="px-6 py-8 text-center">
                      <p className="text-gray-500">No items available in this category</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Powered by QR Menu</p>
          <p className="mt-1">
            Last updated: {new Date(menu.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Floating Action Button for Accessibility */}
      <button
        onClick={() => {
          const allCategoryIds = menu.categories.map(cat => cat.id)
          if (expandedCategories.size === allCategoryIds.length) {
            setExpandedCategories(new Set())
          } else {
            setExpandedCategories(new Set(allCategoryIds))
          }
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-4 focus:ring-primary-200"
        style={{ backgroundColor: template.colors.primary }}
        aria-label={expandedCategories.size === menu.categories.length ? 'Collapse all categories' : 'Expand all categories'}
      >
        {expandedCategories.size === menu.categories.length ? (
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
    </div>
  )
}

export default PublicMenuPage
