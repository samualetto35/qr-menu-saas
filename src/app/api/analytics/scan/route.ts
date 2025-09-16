import { NextRequest, NextResponse } from 'next/server'
import { analytics } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { menuId, deviceType, userAgent, timestamp } = body

    if (!menuId || !deviceType) {
      return NextResponse.json(
        { success: false, message: 'Menu ID and device type are required' },
        { status: 400 }
      )
    }

    // Validate device type
    if (!['mobile', 'tablet', 'desktop'].includes(deviceType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid device type' },
        { status: 400 }
      )
    }

    // Track the scan
    analytics.incrementScan(menuId, deviceType)

    return NextResponse.json({
      success: true,
      message: 'Scan tracked successfully'
    })

  } catch (error) {
    console.error('Track scan error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
