import { NextRequest, NextResponse } from 'next/server'
import { menus, jwt_helpers } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt_helpers.verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    const menuId = params.id
    const body = await request.json()

    // Get the existing menu to verify ownership
    const existingMenu = menus.findById(menuId)
    if (!existingMenu) {
      return NextResponse.json(
        { success: false, message: 'Menu not found' },
        { status: 404 }
      )
    }

    if (existingMenu.userId !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update the menu
    const updatedMenu = menus.update(menuId, {
      name: body.name,
      description: body.description,
      categories: body.categories,
      updatedAt: new Date().toISOString()
    })

    if (!updatedMenu) {
      return NextResponse.json(
        { success: false, message: 'Failed to update menu' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Menu updated successfully',
      menu: updatedMenu
    })

  } catch (error) {
    console.error('Menu update error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt_helpers.verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    const menuId = params.id

    // Get the existing menu to verify ownership
    const existingMenu = menus.findById(menuId)
    if (!existingMenu) {
      return NextResponse.json(
        { success: false, message: 'Menu not found' },
        { status: 404 }
      )
    }

    if (existingMenu.userId !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete the menu
    const deleted = menus.delete(menuId)

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete menu' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Menu deleted successfully'
    })

  } catch (error) {
    console.error('Menu deletion error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
