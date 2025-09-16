import { NextRequest, NextResponse } from 'next/server'
import { users, menus, analytics, jwt_helpers } from '@/lib/database'

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

    // Get user's analytics data
    const userAnalytics = analytics.findByUserId(decoded.userId)

    return NextResponse.json({
      success: true,
      analytics: userAnalytics
    })

  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
