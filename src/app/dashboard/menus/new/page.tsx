'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { MenuCategory, MenuItem, MenuTemplate } from '@/types'
import { colorTemplates, fontOptions, getColorTemplateById, getFontById } from '@/lib/templates'
import { ColorTemplate, FontOption } from '@/types'
import FontLoader from '@/components/FontLoader'

interface NewMenuData {
  name: string
  description: string
  categories: MenuCategory[]
  colorTemplate: ColorTemplate
  selectedFont: FontOption
}

const predefinedCategories = [
  '🍕 Pizza',
  '🍔 Burgers', 
  '🥗 Salads',
  '🍝 Pasta',
  '🥩 Main Dishes',
  '🍲 Soups',
  '🥪 Sandwiches',
  '🍟 Sides',
  '🍰 Desserts',
  '☕ Hot Drinks',
  '🥤 Cold Drinks',
  '🍷 Alcoholic Beverages',
  '🧊 Non-Alcoholic',
  '🥞 Breakfast',
  '🌮 Mexican',
  '🍜 Asian',
  '🍕 Italian',
  '🥙 Mediterranean'
]

const commonIngredients = [
  'Tomato', 'Cheese', 'Lettuce', 'Onion', 'Garlic', 'Basil', 'Oregano', 'Pepper',
  'Salt', 'Olive Oil', 'Mushrooms', 'Bell Pepper', 'Spinach', 'Chicken', 'Beef',
  'Pork', 'Fish', 'Salmon', 'Shrimp', 'Eggs', 'Milk', 'Cream', 'Butter', 'Flour',
  'Rice', 'Pasta', 'Bread', 'Avocado', 'Bacon', 'Ham', 'Mozzarella', 'Parmesan'
]

// Using templates from templates.ts - no local definition needed

const CreateMenuPage: React.FC = () => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const [menuData, setMenuData] = useState<NewMenuData>({
    name: '',
    description: '',
    categories: [],
    colorTemplate: colorTemplates[0], // First color template
    selectedFont: fontOptions[0] // First font option
  })

  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingItem, setEditingItem] = useState<{
    categoryId: string
    item: Partial<MenuItem>
    isNew: boolean
  } | null>(null)

  // Step 1: Menu Name
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (menuData.name.trim()) {
      setCurrentStep(2)
    }
  }

  // Step 2: Categories
  const addPredefinedCategory = (categoryName: string) => {
    const newCategory: MenuCategory = {
      id: `cat_${Date.now()}`,
      menuId: '',
      name: categoryName,
      order: menuData.categories.length,
      items: []
    }
    setMenuData(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }))
  }

  const addCustomCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: MenuCategory = {
        id: `cat_${Date.now()}`,
        menuId: '',
        name: newCategoryName,
        order: menuData.categories.length,
        items: []
      }
      setMenuData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory]
      }))
      setNewCategoryName('')
    }
  }

  const removeCategory = (categoryId: string) => {
    setMenuData(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== categoryId)
    }))
  }

  const moveCategory = (categoryId: string, direction: 'up' | 'down') => {
    setMenuData(prev => {
      const categories = [...prev.categories]
      const index = categories.findIndex(cat => cat.id === categoryId)
      
      if (direction === 'up' && index > 0) {
        [categories[index], categories[index - 1]] = [categories[index - 1], categories[index]]
      } else if (direction === 'down' && index < categories.length - 1) {
        [categories[index], categories[index + 1]] = [categories[index + 1], categories[index]]
      }
      
      return { ...prev, categories }
    })
  }

  // Step 3: Items
  const openItemEditor = (categoryId: string, item?: MenuItem) => {
    setEditingItem({
      categoryId,
      item: item || {
        name: '',
        description: '',
        price: undefined,
        ingredients: [],
        isAvailable: true
      },
      isNew: !item
    })
  }

  const saveItem = () => {
    if (!editingItem || !editingItem.item.name?.trim()) return

    setMenuData(prev => {
      const categories = prev.categories.map(category => {
        if (category.id === editingItem.categoryId) {
          if (editingItem.isNew) {
            const newItem: MenuItem = {
              id: `item_${Date.now()}`,
              categoryId: category.id,
              name: editingItem.item.name!,
              description: editingItem.item.description,
              price: editingItem.item.price,
              ingredients: editingItem.item.ingredients || [],
              imageUrl: editingItem.item.imageUrl,
              isAvailable: editingItem.item.isAvailable ?? true,
              order: category.items.length
            }
            return {
              ...category,
              items: [...category.items, newItem]
            }
          } else {
            return {
              ...category,
              items: category.items.map(item =>
                item.id === editingItem.item.id
                  ? { ...item, ...editingItem.item }
                  : item
              )
            }
          }
        }
        return category
      })
      return { ...prev, categories }
    })
    
    setEditingItem(null)
  }

  const removeItem = (categoryId: string, itemId: string) => {
    setMenuData(prev => ({
      ...prev,
      categories: prev.categories.map(category =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.filter(item => item.id !== itemId)
            }
          : category
      )
    }))
  }

  // Step 4: Color Template
  const selectColorTemplate = (colorTemplate: ColorTemplate) => {
    setMenuData(prev => ({ ...prev, colorTemplate }))
  }

  // Step 5: Font Selection
  const selectFont = (font: FontOption) => {
    setMenuData(prev => ({ ...prev, selectedFont: font }))
  }

  // Final Submit
  const handleFinalSubmit = async () => {
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('authToken')
      
      // Create the full menu object with combined template
      const combinedTemplate: MenuTemplate = {
        id: `${menuData.colorTemplate.id}-${menuData.selectedFont.id}`,
        name: `${menuData.colorTemplate.name} with ${menuData.selectedFont.displayName}`,
        colors: menuData.colorTemplate.colors,
        fonts: {
          heading: menuData.selectedFont.name,
          body: menuData.selectedFont.name
        },
        layout: 'modern'
      }

      const menuPayload = {
        name: menuData.name,
        description: menuData.description,
        template: combinedTemplate,
        categories: menuData.categories
      }
      
      const response = await fetch('/api/menus', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(menuPayload)
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/dashboard/menus/${result.menu.id}/success`)
      } else {
        throw new Error('Failed to create menu')
      }
    } catch (error) {
      console.error('Failed to create menu:', error)
      alert('Failed to create menu. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { number: 1, title: 'Name Menu', description: 'Give your menu a name' },
    { number: 2, title: 'Add Categories', description: 'Organize your menu items' },
    { number: 3, title: 'Add Items', description: 'Create your menu items' },
    { number: 4, title: 'Choose Colors', description: 'Select color scheme' },
    { number: 5, title: 'Choose Font', description: 'Pick typography style' }
  ]

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="text-center pb-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2">Create New Menu</h1>
          <p className="text-sm sm:text-base text-gray-600">Follow the steps below to create your digital menu</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6">
          {/* Mobile Progress - Current Step + Dots */}
          <div className="block sm:hidden">
            <div className="text-center mb-4">
              <div className="text-sm font-medium text-primary-600 mb-1">
                Step {currentStep} of {steps.length}
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {steps[currentStep - 1].title}
              </div>
              <div className="text-sm text-gray-500">
                {steps[currentStep - 1].description}
              </div>
            </div>
            
            {/* Progress Dots */}
            <div className="flex justify-center space-x-2">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`
                    w-2.5 h-2.5 rounded-full transition-all duration-300
                    ${currentStep === step.number
                      ? 'bg-primary-600 scale-125'
                      : currentStep > step.number
                      ? 'bg-primary-400'
                      : 'bg-gray-300'
                    }
                  `}
                />
              ))}
            </div>
          </div>

          {/* Desktop Progress - Full Steps */}
          <nav aria-label="Progress" className="hidden sm:block">
            <ol className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li key={step.number} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      step.number <= currentStep
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'border-gray-300 text-gray-500'
                    }`}>
                      {step.number < currentStep ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{step.number}</span>
                      )}
                    </div>
                    <div className="ml-4 min-w-0">
                      <p className={`text-sm font-medium ${step.number <= currentStep ? 'text-primary-600' : 'text-gray-500'}`}>
                        {step.title}
                      </p>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-5 right-4 w-full">
                      <div className={`h-0.5 ${step.number < currentStep ? 'bg-primary-600' : 'bg-gray-300'}`} />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
          {/* Step 1: Name Menu */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Name Your Menu</h2>
                <p className="text-gray-600">Give your menu a descriptive name that your customers will see.</p>
              </div>
              
              <div>
                <label className="form-label">Menu Name</label>
                <input
                  type="text"
                  value={menuData.name}
                  onChange={(e) => setMenuData(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  placeholder="e.g., Main Menu, Drinks Menu, Breakfast Menu"
                  required
                />
              </div>

              <div>
                <label className="form-label">Description (Optional)</label>
                <textarea
                  value={menuData.description}
                  onChange={(e) => setMenuData(prev => ({ ...prev, description: e.target.value }))}
                  className="form-input h-24 resize-none"
                  placeholder="Brief description of this menu..."
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn-primary">
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Add Categories */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Add Categories</h2>
                <p className="text-gray-600">Organize your menu items into categories like "Appetizers", "Main Dishes", etc.</p>
              </div>

              {/* Quick Add Categories */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Add Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {predefinedCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => addPredefinedCategory(category)}
                      className="p-3 text-sm text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={menuData.categories.some(cat => cat.name === category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Category */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Add Custom Category</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="form-input flex-1"
                    placeholder="Enter category name..."
                    onKeyPress={(e) => e.key === 'Enter' && addCustomCategory()}
                  />
                  <button
                    onClick={addCustomCategory}
                    className="btn-primary"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Current Categories */}
              {menuData.categories.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Your Categories</h3>
                  <div className="space-y-2">
                    {menuData.categories.map((category, index) => (
                      <div key={category.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{category.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveCategory(category.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveCategory(category.id, 'down')}
                            disabled={index === menuData.categories.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeCategory(category.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={menuData.categories.length === 0}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Add Items */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Add Menu Items</h2>
                <p className="text-gray-600">Add items to your categories with names, prices, descriptions, and photos.</p>
              </div>

              {menuData.categories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <button
                      onClick={() => openItemEditor(category.id)}
                      className="btn-primary text-sm"
                    >
                      + Add Item
                    </button>
                  </div>

                  {category.items.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No items in this category yet</p>
                      <button
                        onClick={() => openItemEditor(category.id)}
                        className="btn-secondary"
                      >
                        Add First Item
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {category.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              {item.price && (
                                <span className="text-primary-600 font-semibold">${item.price}</span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600">{item.description}</p>
                            )}
                            {item.ingredients && item.ingredients.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                {item.ingredients.join(', ')}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openItemEditor(category.id, item)}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => removeItem(category.id, item.id)}
                              className="p-2 text-red-400 hover:text-red-600 rounded-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="btn-primary"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Choose Template */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Choose Color Scheme</h2>
                <p className="text-gray-600">Select a color combination that matches your restaurant's personality.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {colorTemplates.map((colorTemplate) => (
                  <div
                    key={colorTemplate.id}
                    className={`border-2 rounded-lg p-3 sm:p-4 lg:p-6 cursor-pointer transition-all ${
                      menuData.colorTemplate.id === colorTemplate.id
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => selectColorTemplate(colorTemplate)}
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{colorTemplate.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{colorTemplate.description}</p>
                      <div className="flex gap-2 mb-3">
                        <div
                          className="w-6 h-6 rounded border border-gray-200"
                          style={{ backgroundColor: colorTemplate.colors.primary }}
                          title="Primary Color"
                        />
                        <div
                          className="w-6 h-6 rounded border border-gray-200"
                          style={{ backgroundColor: colorTemplate.colors.secondary }}
                          title="Secondary Color"
                        />
                        <div
                          className="w-6 h-6 rounded border border-gray-200"
                          style={{ backgroundColor: colorTemplate.colors.accent }}
                          title="Accent Color"
                        />
                      </div>
                    </div>

                    {/* Color Preview */}
                    <div 
                      className="border border-gray-200 rounded p-4 text-sm"
                      style={{ 
                        backgroundColor: colorTemplate.colors.background,
                        color: colorTemplate.colors.text 
                      }}
                    >
                      <div 
                        className="font-bold mb-2"
                        style={{ 
                          color: colorTemplate.colors.primary
                        }}
                      >
                        {menuData.name || 'Your Restaurant'}
                      </div>
                      <div className="mb-3">
                        <div 
                          className="font-medium mb-1"
                          style={{ color: colorTemplate.colors.primary }}
                        >
                          🍝 Sample Category
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Spaghetti Carbonara</span>
                            <span style={{ color: colorTemplate.colors.accent }}>$18</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Grilled Salmon</span>
                            <span style={{ color: colorTemplate.colors.accent }}>$24</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {menuData.colorTemplate.id === colorTemplate.id && (
                      <div className="mt-4 flex items-center gap-2 text-primary-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>


              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="btn-primary"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Choose Font */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <FontLoader fonts={fontOptions} />
              
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Choose Typography</h2>
                <p className="text-gray-600">Select a font that reflects your restaurant's personality and style.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {fontOptions.map((font) => (
                  <div
                    key={font.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      menuData.selectedFont.id === font.id
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => selectFont(font)}
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{font.displayName}</h3>
                      <p className="text-sm text-gray-600">{font.category}</p>
                    </div>

                    {/* Font Preview */}
                    <div className="border border-gray-200 rounded p-4 bg-white">
                      <div 
                        className="text-lg font-bold mb-2"
                        style={{ 
                          fontFamily: `${font.name}, ${font.fallback}`,
                          color: menuData.colorTemplate.colors.primary
                        }}
                      >
                        Restaurant Menu
                      </div>
                      <div 
                        className="text-sm mb-1"
                        style={{ 
                          fontFamily: `${font.name}, ${font.fallback}`,
                          color: menuData.colorTemplate.colors.text
                        }}
                      >
                        Fresh ingredients, bold flavors
                      </div>
                      <div 
                        className="text-xs flex justify-between"
                        style={{ 
                          fontFamily: `${font.name}, ${font.fallback}`,
                          color: menuData.colorTemplate.colors.text
                        }}
                      >
                        <span>Sample Item</span>
                        <span style={{ color: menuData.colorTemplate.colors.accent }}>$19</span>
                      </div>
                    </div>

                    {menuData.selectedFont.id === font.id && (
                      <div className="mt-3 flex items-center gap-2 text-primary-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Live Preview with Color + Font */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Preview</h3>
                <div 
                  className="border rounded-lg p-6 bg-white max-w-md"
                  style={{ 
                    backgroundColor: menuData.colorTemplate.colors.background,
                    color: menuData.colorTemplate.colors.text,
                    fontFamily: `${menuData.selectedFont.name}, ${menuData.selectedFont.fallback}`
                  }}
                >
                  <div 
                    className="text-center border-b pb-4 mb-4"
                    style={{ 
                      borderColor: menuData.colorTemplate.colors.secondary
                    }}
                  >
                    <h4 
                      className="text-xl font-bold"
                      style={{ 
                        color: menuData.colorTemplate.colors.primary,
                        fontFamily: `${menuData.selectedFont.name}, ${menuData.selectedFont.fallback}`
                      }}
                    >
                      {menuData.name || 'Your Restaurant'}
                    </h4>
                    {menuData.description && (
                      <p className="text-sm mt-1 opacity-80">{menuData.description}</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 
                        className="font-semibold mb-2"
                        style={{ color: menuData.colorTemplate.colors.primary }}
                      >
                        🍝 Featured Items
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Signature Pasta</span>
                          <span style={{ color: menuData.colorTemplate.colors.accent }}>$22</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Grilled Speciality</span>
                          <span style={{ color: menuData.colorTemplate.colors.accent }}>$28</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={isLoading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading && (
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isLoading ? 'Creating Menu...' : 'Save & Generate QR'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Item Editor Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingItem.isNew ? 'Add Menu Item' : 'Edit Menu Item'}
                </h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="form-label">Item Name *</label>
                  <input
                    type="text"
                    value={editingItem.item.name || ''}
                    onChange={(e) => setEditingItem(prev => prev ? {
                      ...prev,
                      item: { ...prev.item, name: e.target.value }
                    } : null)}
                    className="form-input"
                    placeholder="e.g., Margherita Pizza"
                  />
                </div>

                <div>
                  <label className="form-label">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.item.price || ''}
                    onChange={(e) => setEditingItem(prev => prev ? {
                      ...prev,
                      item: { ...prev.item, price: e.target.value ? parseFloat(e.target.value) : undefined }
                    } : null)}
                    className="form-input"
                    placeholder="e.g., 18.50"
                  />
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={editingItem.item.description || ''}
                    onChange={(e) => setEditingItem(prev => prev ? {
                      ...prev,
                      item: { ...prev.item, description: e.target.value }
                    } : null)}
                    className="form-input h-20 resize-none"
                    placeholder="Brief description of the item..."
                  />
                </div>

                <div>
                  <label className="form-label">Ingredients</label>
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(editingItem.item.ingredients || []).map((ingredient, index) => (
                        <span key={index} className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                          {ingredient}
                          <button
                            onClick={() => setEditingItem(prev => prev ? {
                              ...prev,
                              item: {
                                ...prev.item,
                                ingredients: (prev.item.ingredients || []).filter((_, i) => i !== index)
                              }
                            } : null)}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
                      {commonIngredients
                        .filter(ing => !(editingItem.item.ingredients || []).includes(ing))
                        .map((ingredient) => (
                          <button
                            key={ingredient}
                            onClick={() => setEditingItem(prev => prev ? {
                              ...prev,
                              item: {
                                ...prev.item,
                                ingredients: [...(prev.item.ingredients || []), ingredient]
                              }
                            } : null)}
                            className="text-xs p-1 text-left border border-gray-200 rounded hover:bg-gray-50"
                          >
                            {ingredient}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={editingItem.item.isAvailable ?? true}
                    onChange={(e) => setEditingItem(prev => prev ? {
                      ...prev,
                      item: { ...prev.item, isAvailable: e.target.checked }
                    } : null)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="available" className="text-sm text-gray-700">
                    Item is available
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingItem(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={saveItem}
                  disabled={!editingItem.item.name?.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingItem.isNew ? 'Add Item' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default CreateMenuPage
