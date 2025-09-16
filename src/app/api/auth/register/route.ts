import { NextRequest, NextResponse } from 'next/server'
import { validateEmail, validatePhone, validatePassword } from '@/lib/validation'
import { users, jwt_helpers, subscriptions } from '@/lib/database'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, businessName, email, phone, password, countryCode } = body

    // Validation
    if (!fullName || !businessName || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (!validatePhone(phone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number' },
        { status: 400 }
      )
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, message: passwordValidation.errors[0] },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = users.findByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = await users.create({
      fullName,
      businessName,
      email,
      phone,
      countryCode,
      isEmailVerified: false,
      isPhoneVerified: false,
      subscriptionStatus: 'trial',
      subscriptionPlan: 'starter',
      subscriptionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      emailVerificationToken: uuidv4(),
      phoneVerificationToken: Math.floor(100000 + Math.random() * 900000).toString(),
      password // This will be hashed in the database function
    })

    // Create trial subscription
    await subscriptions.create({
      userId: newUser.id,
      plan: 'starter',
      status: 'trial',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false
    })

    // Generate JWT token
    const token = jwt_helpers.generateToken(newUser.id)

    // Remove password from response
    const { password: _, ...userResponse } = newUser

    // TODO: Send verification email and SMS
    console.log(`Email verification token: ${newUser.emailVerificationToken}`)
    console.log(`Phone verification token: ${newUser.phoneVerificationToken}`)

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email and phone for verification.',
      user: userResponse,
      token
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
