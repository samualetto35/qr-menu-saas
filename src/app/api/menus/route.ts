import { NextRequest, NextResponse } from 'next/server'
import { users, menus, jwt_helpers, analytics } from '@/lib/database'
import { generateMenuQRCode } from '@/lib/qr-generator'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const token = authHeader.substring(7)
    const decoded = jwt_helpers.verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get user menus
    const userMenus = menus.findByUserId(decoded.userId)

    return NextResponse.json({
      success: true,
      menus: userMenus
    })

  } catch (error) {
    console.error('Get menus error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const token = authHeader.substring(7)
    const decoded = jwt_helpers.verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, categories, template } = body

    // Validation
    if (!name || !categories || categories.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Menu name and at least one category are required' },
        { status: 400 }
      )
    }

    // Create menu in database first
    const newMenu = menus.create({
      userId: decoded.userId,
      name,
      description,
      isActive: true,
      qrCode: '', // Will be updated after QR generation
      url: '', // Will be updated after QR generation
      template,
      categories: categories.map((cat: any, index: number) => {
        const categoryId = `cat_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`
        return {
          ...cat,
          id: categoryId,
          menuId: '', // Will be set after menu creation
          items: cat.items.map((item: any, itemIndex: number) => ({
            ...item,
            id: `item_${Date.now()}_${itemIndex}_${Math.random().toString(36).substr(2, 5)}`,
            categoryId: categoryId
          }))
        }
      })
    })

    // Update category menuIds
    newMenu.categories = newMenu.categories.map(cat => ({
      ...cat,
      menuId: newMenu.id
    }))

    // Generate QR code
    try {
      const { base64, fileUrl } = await generateMenuQRCode(newMenu.id, newMenu.name)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
      
      // Update menu with QR code and URL
      const updatedMenu = menus.update(newMenu.id, {
        qrCode: base64,
        url: `${baseUrl}/menu/${newMenu.id}`,
        categories: newMenu.categories
      })

      // Create initial analytics record
      analytics.create({
        menuId: newMenu.id,
        totalScans: 0,
        uniqueScans: 0,
        scansToday: 0,
        scansThisWeek: 0,
        scansThisMonth: 0,
        deviceBreakdown: { mobile: 0, tablet: 0, desktop: 0 }
      })

      return NextResponse.json({
        success: true,
        message: 'Menu created successfully',
        menu: updatedMenu
      })

    } catch (qrError) {
      console.error('QR code generation failed:', qrError)
      
      // Update with fallback URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
      const updatedMenu = menus.update(newMenu.id, {
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        url: `${baseUrl}/menu/${newMenu.id}`,
        categories: newMenu.categories
      })

      return NextResponse.json({
        success: true,
        message: 'Menu created successfully (QR code generation had issues)',
        menu: updatedMenu
      })
    }

  } catch (error) {
    console.error('Create menu error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}