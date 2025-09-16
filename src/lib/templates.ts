// Separate interfaces for color templates and fonts
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

// Legacy interface for backward compatibility
export interface Template extends ColorTemplate {
  layout: string
  fonts: {
    heading: string
    body: string
  }
}

// Color-only templates (expanded selection)
export const colorTemplates: ColorTemplate[] = [
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Professional blue with clean whites',
    colors: {
      primary: '#0066cc',
      secondary: '#f8f9fa',
      accent: '#28a745',
      background: '#ffffff',
      text: '#212529'
    }
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Natural green with earth tones',
    colors: {
      primary: '#059669',
      secondary: '#f0fdf4',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#064e3b'
    }
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Luxurious purple with gold highlights',
    colors: {
      primary: '#7c3aed',
      secondary: '#faf5ff',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#581c87'
    }
  },
  {
    id: 'burgundy-wine',
    name: 'Burgundy Wine',
    description: 'Rich wine colors with cream',
    colors: {
      primary: '#991b1b',
      secondary: '#fef2f2',
      accent: '#f59e0b',
      background: '#fffbeb',
      text: '#7f1d1d'
    }
  },
  {
    id: 'navy-classic',
    name: 'Navy Classic',
    description: 'Timeless navy with red accents',
    colors: {
      primary: '#1e40af',
      secondary: '#f1f5f9',
      accent: '#dc2626',
      background: '#f8fafc',
      text: '#374151'
    }
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Vibrant orange with warm tones',
    colors: {
      primary: '#ea580c',
      secondary: '#fff7ed',
      accent: '#059669',
      background: '#ffffff',
      text: '#9a3412'
    }
  },
  {
    id: 'midnight-black',
    name: 'Midnight Black',
    description: 'Sophisticated black and gold',
    colors: {
      primary: '#000000',
      secondary: '#f5f5f5',
      accent: '#fbbf24',
      background: '#ffffff',
      text: '#1f2937'
    }
  },
  {
    id: 'sage-cream',
    name: 'Sage & Cream',
    description: 'Soft sage green with warm cream',
    colors: {
      primary: '#10b981',
      secondary: '#f0f9ff',
      accent: '#f97316',
      background: '#fefdf8',
      text: '#064e3b'
    }
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'Elegant rose with metallic accents',
    colors: {
      primary: '#be185d',
      secondary: '#fdf2f8',
      accent: '#d97706',
      background: '#fffbf7',
      text: '#831843'
    }
  },
  {
    id: 'ocean-teal',
    name: 'Ocean Teal',
    description: 'Cool teal with aqua highlights',
    colors: {
      primary: '#0891b2',
      secondary: '#f0fdfa',
      accent: '#f97316',
      background: '#ffffff',
      text: '#164e63'
    }
  },
  {
    id: 'terracotta-earth',
    name: 'Terracotta Earth',
    description: 'Earthy terracotta with warm browns',
    colors: {
      primary: '#c2410c',
      secondary: '#fef7ed',
      accent: '#059669',
      background: '#fffbf7',
      text: '#9a3412'
    }
  },
  {
    id: 'lavender-soft',
    name: 'Lavender Dreams',
    description: 'Soft lavender with gentle purples',
    colors: {
      primary: '#8b5cf6',
      secondary: '#faf5ff',
      accent: '#f472b6',
      background: '#ffffff',
      text: '#6b21a8'
    }
  },
  {
    id: 'charcoal-modern',
    name: 'Charcoal Modern',
    description: 'Contemporary charcoal with bright accents',
    colors: {
      primary: '#374151',
      secondary: '#f9fafb',
      accent: '#10b981',
      background: '#ffffff',
      text: '#111827'
    }
  },
  {
    id: 'warm-amber',
    name: 'Warm Amber',
    description: 'Golden amber with rich browns',
    colors: {
      primary: '#d97706',
      secondary: '#fffbeb',
      accent: '#dc2626',
      background: '#ffffff',
      text: '#92400e'
    }
  },
  {
    id: 'cool-slate',
    name: 'Cool Slate',
    description: 'Modern slate with blue undertones',
    colors: {
      primary: '#475569',
      secondary: '#f8fafc',
      accent: '#0ea5e9',
      background: '#ffffff',
      text: '#1e293b'
    }
  }
]

// Font options with Google Fonts support
export const fontOptions: FontOption[] = [
  {
    id: 'inter',
    name: 'Inter',
    displayName: 'Inter',
    category: 'Modern & Clean',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    fallback: 'system-ui, -apple-system, sans-serif'
  },
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    displayName: 'Playfair Display',
    category: 'Elegant & Luxury',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    id: 'poppins',
    name: 'Poppins',
    displayName: 'Poppins',
    category: 'Friendly & Rounded',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    id: 'merriweather',
    name: 'Merriweather',
    displayName: 'Merriweather',
    category: 'Traditional & Readable',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    displayName: 'Montserrat',
    category: 'Bold & Contemporary',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    id: 'lora',
    name: 'Lora',
    displayName: 'Lora',
    category: 'Sophisticated & Warm',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    id: 'roboto',
    name: 'Roboto',
    displayName: 'Roboto',
    category: 'Tech & Modern',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    id: 'cormorant-garamond',
    name: 'Cormorant Garamond',
    displayName: 'Cormorant Garamond',
    category: 'Classic & Refined',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap',
    fallback: 'Georgia, serif'
  }
]

// Legacy templates for backward compatibility
export const templates: Template[] = colorTemplates.map(colorTemplate => ({
  ...colorTemplate,
  layout: 'modern',
  fonts: {
    heading: 'Inter',
    body: 'Inter'
  }
}))

// Legacy color options for backward compatibility
export const colorOptions = [
  { name: 'Blue', value: '#0066cc' },
  { name: 'Navy', value: '#1e40af' },
  { name: 'Green', value: '#059669' },
  { name: 'Brown', value: '#8B5A3C' },
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Pink', value: '#be185d' },
  { name: 'Teal', value: '#0891b2' }
]

export const ingredientOptions = [
  'Tomato', 'Cheese', 'Lettuce', 'Onion', 'Garlic', 'Basil', 'Oregano', 'Pepper',
  'Salt', 'Olive Oil', 'Mushrooms', 'Bell Pepper', 'Spinach', 'Chicken', 'Beef',
  'Pork', 'Fish', 'Salmon', 'Shrimp', 'Eggs', 'Milk', 'Cream', 'Butter', 'Flour',
  'Rice', 'Pasta', 'Bread', 'Avocado', 'Bacon', 'Ham', 'Mozzarella', 'Parmesan',
  'Cheddar', 'Feta', 'Goat Cheese', 'Pine Nuts', 'Walnuts', 'Almonds', 'Honey',
  'Lemon', 'Lime', 'Cilantro', 'Parsley', 'Thyme', 'Rosemary', 'Paprika', 'Cumin'
]

export const categoryOptions = [
  '🍕 Pizza', '🍔 Burgers', '🥗 Salads', '🍝 Pasta', '🥩 Main Dishes', 
  '🍲 Soups', '🥪 Sandwiches', '🍟 Sides', '🍰 Desserts', '☕ Hot Drinks',
  '🥤 Cold Drinks', '🍷 Alcoholic Beverages', '🧊 Non-Alcoholic', '🥞 Breakfast',
  '🌮 Mexican', '🍜 Asian', '🍕 Italian', '🥙 Mediterranean', '🍛 Indian',
  '🍣 Sushi', '🥘 Stews', '🧀 Cheese', '🥩 Grilled', '🔥 Spicy'
]

// Helper functions
export const getTemplateById = (id: string): Template | undefined => {
  return templates.find(template => template.id === id)
}

export const getColorTemplateById = (id: string): ColorTemplate | undefined => {
  return colorTemplates.find(template => template.id === id)
}

export const getFontById = (id: string): FontOption | undefined => {
  return fontOptions.find(font => font.id === id)
}

export const getFontByName = (name: string): FontOption | undefined => {
  return fontOptions.find(font => font.name === name)
}