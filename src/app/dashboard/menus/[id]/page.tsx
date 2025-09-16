'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Menu, MenuCategory, MenuItem } from '@/types'
import { colorTemplates, fontOptions, getColorTemplateById, getFontById, getTemplateById, ingredientOptions, categoryOptions } from '@/lib/templates'
import { ColorTemplate, FontOption } from '@/types'
import FontLoader from '@/components/FontLoader'
import Notification from '@/components/Notification'

const MenuEditPage: React.FC = () => {
  const params = useParams()
  const router = useRouter()
  const [menu, setMenu] = useState<Menu | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'preview'>('content')
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [notification, setNotification] = useState<{
    isVisible: boolean
    type: 'success' | 'error' | 'info' | 'warning'
    title: string
    message: string
  }>({
    isVisible: false,
    type: 'info',
    title: '',
    message: ''
  })

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const menuId = params.id as string
        const token = localStorage.getItem('authToken')
        
        if (!token) {
          router.push('/login')
          return
        }

        // Fetch menu from API
        const response = await fetch('/api/menus', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        const result = await response.json()
        
        if (!result.success) {
          router.push('/dashboard/menus')
          return
        }

        const foundMenu = result.menus.find((m: Menu) => m.id === menuId)
        
        if (!foundMenu) {
          router.push('/dashboard/menus')
          return
        }

        setMenu(foundMenu)
        
      } catch (error) {
        console.error('Failed to load menu:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMenu()
  }, [params.id, router])

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    setNotification({
      isVisible: true,
      type,
      title,
      message
    })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }))
  }

  const handleMenuUpdate = (field: string, value: string) => {
    if (!menu) return
    setMenu({ ...menu, [field]: value })
  }

  const handleTemplateChange = (templateId: string) => {
    if (!menu) return
    const template = getTemplateById(templateId)
    if (!template) return
    
    setMenu({
      ...menu,
      template: {
        id: template.id,
        name: template.name,
        colors: { ...template.colors },
        fonts: { ...template.fonts },
        layout: template.layout
      }
    })
    setShowTemplateModal(false)
  }

  const handleColorChange = (colorType: string, color: string) => {
    if (!menu) return
    setMenu({
      ...menu,
      template: {
        ...menu.template,
        colors: {
          ...menu.template.colors,
          [colorType]: color
        }
      }
    })
  }

  const handleFontChange = (fontType: string, font: string) => {
    if (!menu) return
    setMenu({
      ...menu,
      template: {
        ...menu.template,
        fonts: {
          ...menu.template.fonts,
          [fontType]: font
        }
      }
    })
  }

  const handleCategoryUpdate = (categoryId: string, field: string, value: string) => {
    if (!menu) return
    setMenu({
      ...menu,
      categories: menu.categories.map(cat =>
        cat.id === categoryId ? { ...cat, [field]: value } : cat
      )
    })
  }

  const handleItemUpdate = (categoryId: string, itemId: string, field: string, value: any) => {
    if (!menu) return
    setMenu({
      ...menu,
      categories: menu.categories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map(item =>
                item.id === itemId ? { ...item, [field]: value } : item
              )
            }
          : cat
      )
    })
  }

  const addCategory = () => {
    if (!menu) return
    const newCategory: MenuCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: 'New Category',
      items: [],
      menuId: menu.id
    }
    setMenu({
      ...menu,
      categories: [...menu.categories, newCategory]
    })
  }

  const addCategoryWithName = (categoryName: string) => {
    if (!menu) return
    const newCategory: MenuCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: categoryName,
      items: [],
      menuId: menu.id
    }
    setMenu({
      ...menu,
      categories: [...menu.categories, newCategory]
    })
  }

  const addItem = (categoryId: string) => {
    if (!menu) return
    const newItem: Item = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: 'New Item',
      price: 0,
      description: '',
      isAvailable: true,
      categoryId
    }
    setMenu({
      ...menu,
      categories: menu.categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: [...cat.items, newItem] }
          : cat
      )
    })
  }

  const removeCategory = (categoryId: string) => {
    if (!menu) return
    setMenu({
      ...menu,
      categories: menu.categories.filter(cat => cat.id !== categoryId)
    })
  }

  const removeItem = (categoryId: string, itemId: string) => {
    if (!menu) return
    setMenu({
      ...menu,
      categories: menu.categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
          : cat
      )
    })
  }

  const handleSave = async () => {
    if (!menu) return
    
    setIsSaving(true)
    setErrors({})

    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        showNotification('error', 'Authentication Error', 'Please log in again.')
        router.push('/login')
        return
      }

      // Prepare menu data with updated timestamp
      const menuData = {
        ...menu,
        updatedAt: new Date().toISOString()
      }
      
      const response = await fetch(`/api/menus/${menu.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(menuData)
      })

      const result = await response.json()
      
      if (result.success) {
        setMenu(result.menu || menuData) // Update with server response
        showNotification('success', 'Success!', 'Menu updated successfully!')
        setErrors({})
      } else {
        const errorMessage = result.message || 'Failed to update menu'
        setErrors({ submit: errorMessage })
        showNotification('error', 'Error', errorMessage)
      }
    } catch (error) {
      console.error('Error saving menu:', error)
      const errorMessage = 'Network error. Please try again.'
      setErrors({ submit: errorMessage })
      showNotification('error', 'Save Error', errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!menu) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Menu Not Found</h1>
          <p className="text-gray-600 mb-6">The menu you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Menu</h1>
            <p className="text-gray-600">Update your menu content and design</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/menus')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{errors.submit}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'content', label: 'Content', icon: '📝' },
              { key: 'design', label: 'Design', icon: '🎨' },
              { key: 'preview', label: 'Preview', icon: '👁️' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Menu Basic Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Menu Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Menu Name</label>
                  <input
                    type="text"
                    value={menu.name}
                    onChange={(e) => handleMenuUpdate('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={menu.description || ''}
                    onChange={(e) => handleMenuUpdate('description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-6">
          {menu.categories.map((category, categoryIndex) => (
            <div key={category.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => handleCategoryUpdate(category.id, 'name', e.target.value)}
                    className="text-lg font-semibold bg-transparent border-none p-0 focus:ring-0 w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => addItem(category.id)}
                    className="text-primary-600 hover:text-primary-700 p-2"
                    title="Add Item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeCategory(category.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                    title="Remove Category"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Item Name</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemUpdate(category.id, item.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.price || ''}
                          onChange={(e) => handleItemUpdate(category.id, item.id, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Available</label>
                        <div className="flex items-center h-[38px]">
                          <input
                            type="checkbox"
                            checked={item.isAvailable}
                            onChange={(e) => handleItemUpdate(category.id, item.id, 'isAvailable', e.target.checked)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">In stock</span>
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeItem(category.id, item.id)}
                          className="text-red-600 hover:text-red-700 p-2"
                          title="Remove Item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                      <textarea
                        value={item.description || ''}
                        onChange={(e) => handleItemUpdate(category.id, item.id, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Optional description of the item..."
                      />
                    </div>
                    
                    {/* Ingredients */}
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-500 mb-2">Ingredients</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(item.ingredients || []).map((ingredient, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs"
                          >
                            {ingredient}
                            <button
                              onClick={() => {
                                const newIngredients = (item.ingredients || []).filter((_, i) => i !== idx)
                                handleItemUpdate(category.id, item.id, 'ingredients', newIngredients)
                              }}
                              className="text-primary-600 hover:text-primary-800 ml-1"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="space-y-3">
                        {/* Quick Add Buttons - Show More Options */}
                        <div className="flex flex-wrap gap-1">
                          {ingredientOptions
                            .filter(ing => !(item.ingredients || []).includes(ing))
                            .slice(0, 12) // Show more options
                            .map((ingredient) => (
                            <button
                              key={ingredient}
                              onClick={() => {
                                const newIngredients = [...(item.ingredients || []), ingredient]
                                handleItemUpdate(category.id, item.id, 'ingredients', newIngredients)
                              }}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                            >
                              + {ingredient}
                            </button>
                          ))}
                        </div>
                        
                        {/* Custom Ingredient Input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add custom ingredient..."
                            className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                const input = e.target as HTMLInputElement
                                const customIngredient = input.value.trim()
                                if (customIngredient && !(item.ingredients || []).includes(customIngredient)) {
                                  const newIngredients = [...(item.ingredients || []), customIngredient]
                                  handleItemUpdate(category.id, item.id, 'ingredients', newIngredients)
                                  input.value = ''
                                }
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement
                              const customIngredient = input.value.trim()
                              if (customIngredient && !(item.ingredients || []).includes(customIngredient)) {
                                const newIngredients = [...(item.ingredients || []), customIngredient]
                                handleItemUpdate(category.id, item.id, 'ingredients', newIngredients)
                                input.value = ''
                              }
                            }}
                            className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        
                        {/* Show More/Less Toggle */}
                        {ingredientOptions.filter(ing => !(item.ingredients || []).includes(ing)).length > 12 && (
                          <button
                            onClick={() => {
                              // Toggle showing more ingredients by updating slice limit
                              const allButtons = document.querySelectorAll(`[data-item-id="${item.id}"] .ingredient-options`)
                              allButtons.forEach(container => {
                                const hiddenButtons = container.querySelectorAll('.hidden')
                                if (hiddenButtons.length > 0) {
                                  hiddenButtons.forEach(btn => btn.classList.remove('hidden'))
                                } else {
                                  const buttons = Array.from(container.children).slice(12)
                                  buttons.forEach(btn => btn.classList.add('hidden'))
                                }
                              })
                            }}
                            className="text-xs text-primary-600 hover:text-primary-700"
                          >
                            Show {ingredientOptions.filter(ing => !(item.ingredients || []).includes(ing)).length - 12} more...
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {category.items.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No items in this category</p>
                    <button
                      onClick={() => addItem(category.id)}
                      className="text-primary-600 hover:text-primary-700 mt-2"
                    >
                      Add your first item
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

              {/* Add Category Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">Add New Category</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {categoryOptions.map((categoryName) => (
                    <button
                      key={categoryName}
                      onClick={() => addCategoryWithName(categoryName)}
                      className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                    >
                      {categoryName}
                    </button>
                  ))}
                </div>
                <button
                  onClick={addCategory}
                  className="mt-3 text-sm text-gray-600 hover:text-primary-600 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Custom category
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Design Tab */}
        {activeTab === 'design' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <FontLoader fonts={fontOptions} />
            {/* Design Controls */}
            <div className="space-y-6">
              {/* Template Selection */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Template</h2>
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="btn-secondary text-sm"
                  >
                    Change Template
                  </button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg border-2"
                      style={{ backgroundColor: menu.template.colors.primary }}
                    ></div>
                    <div>
                      <h3 className="font-medium">{menu.template.name}</h3>
                      <p className="text-sm text-gray-600">Current template</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Gallery */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Template</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {colorTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateChange(template.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        menu.template.id === template.id 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-8 h-8 rounded"
                          style={{ backgroundColor: template.colors.primary }}
                        ></div>
                        <div>
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <p className="text-xs text-gray-500">{template.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {Object.values(template.colors).slice(0, 4).map((color, index) => (
                          <div
                            key={index}
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: color }}
                          ></div>
                        ))}
                      </div>
                      {menu.template.id === template.id && (
                        <div className="mt-2 flex items-center gap-1 text-primary-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-medium">Selected</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Customization */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Typography</h2>
                <div className="grid grid-cols-2 gap-4">
                  {fontOptions.map((font) => (
                    <button
                      key={font.name}
                      onClick={() => {
                        handleFontChange('heading', font.name)
                        handleFontChange('body', font.name)
                      }}
                      className={`p-3 border-2 rounded-lg text-left transition-all ${
                        menu.template.fonts.heading === font.name
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ fontFamily: `${font.name}, ${font.fallback}` }}
                    >
                      <div className="font-medium">{font.displayName}</div>
                      <div className="text-sm text-gray-500">{font.category}</div>
                      <div className="text-xs mt-1" style={{ fontFamily: `${font.name}, ${font.fallback}` }}>
                        Sample Text 123
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h2>
              <div className="border rounded-lg overflow-hidden" style={{ maxHeight: '600px' }}>
                <div 
                  className="p-4 text-center border-b"
                  style={{ 
                    backgroundColor: menu.template.colors.primary,
                    color: 'white',
                    fontFamily: `${menu.template.fonts.heading}, ${getFontById(menu.template.fonts.heading)?.fallback || 'serif'}`
                  }}
                >
                  <h3 className="text-lg font-bold">{menu.name}</h3>
                  {menu.description && (
                    <p className="text-sm opacity-90">{menu.description}</p>
                  )}
                </div>
                <div 
                  className="p-4 space-y-4 overflow-y-auto"
                  style={{ 
                    backgroundColor: menu.template.colors.background,
                    color: menu.template.colors.text,
                    fontFamily: `${menu.template.fonts.body}, ${getFontById(menu.template.fonts.body)?.fallback || 'sans-serif'}`,
                    maxHeight: '500px'
                  }}
                >
                  {menu.categories.slice(0, 2).map((category) => (
                    <div key={category.id} className="border-b pb-3">
                      <h4 
                        className="font-semibold mb-2"
                        style={{ 
                          color: menu.template.colors.primary,
                          fontFamily: `${menu.template.fonts.heading}, ${getFontById(menu.template.fonts.heading)?.fallback || 'serif'}`
                        }}
                      >
                        {category.name}
                      </h4>
                      {category.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between py-1">
                          <div>
                            <span className="font-medium text-sm">{item.name}</span>
                            {item.description && (
                              <p className="text-xs opacity-75">{item.description}</p>
                            )}
                          </div>
                          {item.price && (
                            <span 
                              className="font-bold text-sm"
                              style={{ color: menu.template.colors.accent }}
                            >
                              ${item.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                  {menu.categories.length > 2 && (
                    <p className="text-center text-sm opacity-60">
                      ...and {menu.categories.length - 2} more categories
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Full Menu Preview</h2>
              <p className="text-gray-600">This is how your customers will see your menu</p>
            </div>
            
            <div className="max-w-2xl mx-auto border rounded-lg overflow-hidden">
              <div 
                className="p-6 text-center"
                style={{ 
                  backgroundColor: menu.template.colors.primary,
                  color: 'white',
                  fontFamily: menu.template.fonts.heading
                }}
              >
                <h1 className="text-2xl font-bold mb-2">{menu.name}</h1>
                {menu.description && (
                  <p className="opacity-90">{menu.description}</p>
                )}
              </div>
              
              <div 
                className="p-6 space-y-6"
                style={{ 
                  backgroundColor: menu.template.colors.background,
                  color: menu.template.colors.text,
                  fontFamily: menu.template.fonts.body
                }}
              >
                {menu.categories.map((category) => (
                  <div key={category.id}>
                    <h2 
                      className="text-xl font-semibold mb-4 pb-2 border-b"
                      style={{ 
                        color: menu.template.colors.primary,
                        fontFamily: menu.template.fonts.heading
                      }}
                    >
                      {category.name}
                    </h2>
                    <div className="space-y-3">
                      {category.items.filter(item => item.isAvailable).map((item) => (
                        <div key={item.id} className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm opacity-75 mt-1">{item.description}</p>
                            )}
                          </div>
                          {item.price && (
                            <span 
                              className="font-bold ml-4"
                              style={{ color: menu.template.colors.accent }}
                            >
                              ${item.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Template Selection Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Choose Template</h3>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateChange(template.id)}
                      className={`p-4 border-2 rounded-lg text-left hover:border-primary-300 transition-colors ${
                        menu.template.id === template.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-8 h-8 rounded"
                          style={{ backgroundColor: template.colors.primary }}
                        ></div>
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-xs text-gray-500">{template.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {Object.values(template.colors).slice(0, 4).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-sm"
                            style={{ backgroundColor: color }}
                          ></div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={hideNotification}
        />
      </div>
    </DashboardLayout>
  )
}

export default MenuEditPage
