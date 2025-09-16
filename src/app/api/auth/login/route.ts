import { NextRequest, NextResponse } from 'next/server'
import { validateEmail } from '@/lib/validation'
import { users, jwt_helpers } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, rememberMe } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = users.findByEmail(email)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await users.verifyPassword(password, user.password!)
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Update last login
    users.update(user.id, {
      lastLoginAt: new Date().toISOString()
    })

    // Generate JWT token
    const token = jwt_helpers.generateToken(user.id)

    // Remove password from response
    const { password: _, ...userResponse } = user

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
