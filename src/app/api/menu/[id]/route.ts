import { NextRequest, NextResponse } from 'next/server'
import { menus } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const menuId = params.id

    if (!menuId) {
      return NextResponse.json(
        { success: false, message: 'Menu ID is required' },
        { status: 400 }
      )
    }

    // Find menu by ID
    const menu = menus.findById(menuId)

    if (!menu) {
      return NextResponse.json(
        { success: false, message: 'Menu not found' },
        { status: 404 }
      )
    }

    if (!menu.isActive) {
      return NextResponse.json(
        { success: false, message: 'This menu is temporarily unavailable' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      menu
    })

  } catch (error) {
    console.error('Get menu error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
