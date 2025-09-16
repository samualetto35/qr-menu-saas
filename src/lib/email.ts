import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('Email would be sent in production:', options)
      return // Skip in development if no API key
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'QR Menu SaaS <noreply@qrmenu.app>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    throw new Error('Failed to send email')
  }
}

/**
 * Send email verification email
 */
export async function sendEmailVerification(
  email: string,
  verificationToken: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const verificationUrl = `${baseUrl}/verify?type=email&token=${verificationToken}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .button { 
          display: inline-block; 
          background: #3b82f6; 
          color: white; 
          padding: 12px 30px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0; 
        }
        .footer { text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍽️ QR Menu SaaS</h1>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for signing up for QR Menu SaaS! To complete your registration, please verify your email address by clicking the button below:</p>
          
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
          
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          
          <p>This verification link will expire in 24 hours.</p>
          
          <p>If you didn't create an account with QR Menu SaaS, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2024 QR Menu SaaS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Verify Your Email Address
    
    Thank you for signing up for QR Menu SaaS! To complete your registration, please verify your email address by visiting:
    
    ${verificationUrl}
    
    This verification link will expire in 24 hours.
    
    If you didn't create an account with QR Menu SaaS, you can safely ignore this email.
    
    © 2024 QR Menu SaaS. All rights reserved.
  `

  await sendEmail({
    to: email,
    subject: 'Verify Your Email Address - QR Menu SaaS',
    html,
    text
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .button { 
          display: inline-block; 
          background: #dc2626; 
          color: white; 
          padding: 12px 30px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0; 
        }
        .footer { text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍽️ QR Menu SaaS</h1>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          
          <p>This reset link will expire in 1 hour.</p>
          
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>© 2024 QR Menu SaaS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Reset Your Password
    
    We received a request to reset your password. Visit this link to create a new password:
    
    ${resetUrl}
    
    This reset link will expire in 1 hour.
    
    If you didn't request a password reset, you can safely ignore this email.
    
    © 2024 QR Menu SaaS. All rights reserved.
  `

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - QR Menu SaaS',
    html,
    text
  })
}

/**
 * Send welcome email after successful verification
 */
export async function sendWelcomeEmail(
  email: string,
  firstName: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const dashboardUrl = `${baseUrl}/dashboard`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to QR Menu SaaS</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .button { 
          display: inline-block; 
          background: #10b981; 
          color: white; 
          padding: 12px 30px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0; 
        }
        .footer { text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to QR Menu SaaS!</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName}!</h2>
          <p>Welcome to QR Menu SaaS! Your account has been successfully verified and you're ready to create your first digital menu.</p>
          
          <h3>What you can do now:</h3>
          <ul>
            <li>✨ Create beautiful digital menus</li>
            <li>🎨 Choose from 15 color templates and 8 fonts</li>
            <li>📱 Generate QR codes for contactless ordering</li>
            <li>📊 Track menu analytics and customer engagement</li>
          </ul>
          
          <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
          
          <p>If you have any questions or need help getting started, feel free to reach out to our support team.</p>
          
          <p>Happy menu building!</p>
          <p>The QR Menu SaaS Team</p>
        </div>
        <div class="footer">
          <p>© 2024 QR Menu SaaS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Welcome to QR Menu SaaS! 🎉',
    html
  })
}
